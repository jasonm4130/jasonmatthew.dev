#!/usr/bin/env node
/**
 * Mirror published articles to dev.to with a canonical_url pointing home.
 *
 * dev.to is a SYNDICATION MIRROR, not a home. See
 * docs/distribution-and-syndication.md for why it is
 * the only platform left worth mirroring to, and why the delay below is not optional.
 *
 * Two rules this script exists to enforce:
 *
 *   1. NEVER mirror before the original is indexed. Google treats rel=canonical as
 *      "a hint, not a rule", and a high-authority dev.to copy demonstrably outranks
 *      a low-authority personal domain. Publishing the mirror same-day is how you
 *      lose your own post. Hence SYNDICATE_DELAY_DAYS.
 *   2. NEVER post twice. Idempotency comes from asking dev.to what it already has
 *      (matching on canonical_url), not from a state file in the repo — a stale or
 *      mis-committed state file is the documented way these pipelines spam the API.
 *
 * Usage:
 *   node scripts/syndicate-devto.mjs              # dry run — prints what it WOULD do
 *   node scripts/syndicate-devto.mjs --publish    # actually mirrors
 *   DEVTO_API_KEY=... required for both (the dry run still reads your dev.to articles)
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = path.join(__dirname, '..', 'packages', 'content', 'articles');
const SITE = 'https://jasonmatthew.dev';
const API = 'https://dev.to/api';

// Give Google time to crawl and settle the canonical on the original first.
const SYNDICATE_DELAY_DAYS = Number(process.env.SYNDICATE_DELAY_DAYS ?? 5);
// dev.to caps tags at 4, alphanumeric only.
const MAX_TAGS = 4;
// dev.to rate-limits writes (~10 requests / 30s, undocumented — you find it via 429s).
// The first run is a backfill of the whole archive, so cap the batch and space it out.
const MAX_PER_RUN = Number(process.env.SYNDICATE_MAX_PER_RUN ?? 5);
const THROTTLE_MS = 5_000;

const publish = process.argv.includes('--publish');
const apiKey = process.env.DEVTO_API_KEY;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!apiKey) {
  console.error('DEVTO_API_KEY is not set. Create one at https://dev.to/settings/extensions');
  process.exit(1);
}

const canonicalFor = (slug) => `${SITE}/blog/${slug}`;
const devtoTag = (t) => t.replace(/[^a-z0-9]/gi, '').toLowerCase();

/** MDX that dev.to cannot render: imports and JSX component tags. */
function toPlainMarkdown(body, slug) {
  const withoutImports = body.replace(/^import\s+.*$/gm, '').trimStart();
  const jsx = withoutImports.match(/^<[A-Z][\w.]*/gm);
  if (jsx) {
    console.warn(
      `  ! ${slug}: contains JSX components (${[...new Set(jsx)].join(', ')}) that dev.to will not render.\n` +
        `    Mirror it by hand, or strip the components first. Skipping.`,
    );
    return null;
  }
  return withoutImports;
}

async function devtoRequest(pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) {
    throw new Error(`dev.to ${init.method ?? 'GET'} ${pathname} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

/** Ask dev.to what it already has. Idempotency without a state file. */
async function alreadySyndicated() {
  const mine = [];
  for (let page = 1; ; page++) {
    const batch = await devtoRequest(`/articles/me/all?per_page=100&page=${page}`);
    mine.push(...batch);
    if (batch.length < 100) break;
  }
  return new Set(mine.map((a) => a.canonical_url).filter(Boolean));
}

async function main() {
  const cutoff = Date.now() - SYNDICATE_DELAY_DAYS * 86_400_000;
  const files = (await readdir(ARTICLES_DIR)).filter((f) => f.endsWith('.mdx'));
  const existing = await alreadySyndicated();

  const eligible = [];
  for (const file of files) {
    const slug = path.basename(file, '.mdx');
    const raw = await readFile(path.join(ARTICLES_DIR, file), 'utf8');
    const { data, content } = matter(raw);

    if (data.draft) continue;
    const published = new Date(data.publishDate).getTime();
    if (Number.isNaN(published)) {
      console.warn(`  ! ${slug}: unparseable publishDate — skipping`);
      continue;
    }
    if (published > cutoff) continue; // too fresh: let the original get indexed first
    if (existing.has(canonicalFor(slug))) continue; // already mirrored

    const body = toPlainMarkdown(content, slug);
    if (body === null) continue;

    eligible.push({ slug, data, body });
  }

  if (eligible.length === 0) {
    console.log(
      `Nothing to syndicate. (${files.length} articles; delay ${SYNDICATE_DELAY_DAYS}d; ${existing.size} already mirrored.)`,
    );
    return;
  }

  const batch = eligible.slice(0, MAX_PER_RUN);
  if (eligible.length > batch.length) {
    console.log(
      `${eligible.length} eligible; mirroring ${batch.length} this run (SYNDICATE_MAX_PER_RUN=${MAX_PER_RUN}).\n` +
        `Re-run to continue — dev.to rate-limits writes, and the archive backfill is not worth a 429 storm.\n`,
    );
  }

  for (const [i, { slug, data, body }] of batch.entries()) {
    const article = {
      title: data.title,
      body_markdown: body,
      published: true,
      canonical_url: canonicalFor(slug),
      description: data.excerpt ?? '',
      tags: (data.tags ?? []).map(devtoTag).filter(Boolean).slice(0, MAX_TAGS),
    };

    if (!publish) {
      console.log(
        `[dry run] would mirror "${article.title}"\n           canonical → ${article.canonical_url}\n           tags: ${article.tags.join(', ')}`,
      );
      continue;
    }

    if (i > 0) await sleep(THROTTLE_MS); // stay under dev.to's write rate limit
    const created = await devtoRequest('/articles', { method: 'POST', body: JSON.stringify({ article }) });
    console.log(`mirrored "${article.title}" → ${created.url}`);
  }

  if (!publish) console.log(`\n${eligible.length} eligible. Re-run with --publish to mirror (${MAX_PER_RUN} per run).`);
}

await main();
