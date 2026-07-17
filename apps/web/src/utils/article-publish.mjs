// Single source of truth for build-time "is this article published yet" logic,
// shared by the sitemap filter (astro.config.mjs) and the draft-link remark plugin
// (plugins/remark-rewrite-draft-links.mjs). The runtime equivalent for Astro
// content collections lives in data-utils.ts (isPublished), which uses the
// Zod-parsed Date directly; keep the two in step.
//
// Dependency-free: it hand-parses the two frontmatter fields it needs so it can
// run in the Astro config, where the astro:content API is not available.
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, sep } from 'node:path';

// Brisbane is UTC+10 year-round (no DST). A bare YYYY-MM-DD publishDate parses as
// UTC midnight but authors mean midnight AEST, so shift "now" forward by the offset.
export const BRISBANE_OFFSET_MS = 10 * 60 * 60 * 1000;

/**
 * Targeted parser for the two frontmatter fields we need. Not a general YAML
 * parser, but it handles the forms a publishDate scalar can take — bare date,
 * quoted, ISO timestamp, and a trailing inline comment — matching how Astro's
 * loader + Zod z.coerce.date() would read them.
 * @param {string} raw full file contents
 * @returns {{ draft: boolean, publishDate: Date | null }}
 */
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = m ? m[1] : '';
  const draft = /^draft:\s*true\b/im.test(fm);
  const dateM = fm.match(/^publishDate:\s*(.+?)\s*$/m);
  let publishDate = null;
  if (dateM) {
    const value = dateM[1]
      .replace(/\s+#.*$/, '') // strip a trailing YAML inline comment
      .trim()
      .replace(/^(['"])([\s\S]*)\1$/, '$2'); // strip matching surrounding quotes
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) publishDate = d;
  }
  return { draft, publishDate };
}

/**
 * A post is published once it is not a draft and either has no date or its date
 * has arrived (AEST-adjusted). No date is treated as published.
 * @param {{ draft: boolean, publishDate: Date | null }} state
 * @param {number} now epoch ms
 */
export function isPublished({ draft, publishDate }, now) {
  if (draft) return false;
  if (!publishDate) return true;
  return publishDate.getTime() <= now + BRISBANE_OFFSET_MS;
}

/**
 * A post is "scheduled" (generated but not yet public) when it is a non-draft with
 * a future date — the complement of isPublished for dated non-drafts.
 * @param {{ draft: boolean, publishDate: Date | null }} state
 * @param {number} now epoch ms
 */
export function isFutureDated(state, now) {
  return !state.draft && state.publishDate != null && !isPublished(state, now);
}

/**
 * Read every article and return Map<slug, { draft, publishDate }>, keyed by the
 * Astro content id (path relative to articlesDir, without extension).
 * @param {string} articlesDir absolute path to packages/content/articles
 * @returns {Map<string, { draft: boolean, publishDate: Date | null }>}
 */
export function loadArticleStates(articlesDir) {
  const states = new Map();
  let entries;
  try {
    entries = readdirSync(articlesDir, { recursive: true });
  } catch {
    return states; // no articles dir → nothing to know
  }
  for (const name of entries) {
    const ext = extname(name);
    if (ext !== '.md' && ext !== '.mdx') continue;
    const slug = name.slice(0, -ext.length).split(sep).join('/'); // Astro id uses '/'
    states.set(slug, parseFrontmatter(readFileSync(join(articlesDir, name), 'utf8')));
  }
  return states;
}

/**
 * The set of slugs that are generated but still scheduled — used by the sitemap
 * filter to drop pre-publish pages.
 * @param {string} articlesDir absolute path to packages/content/articles
 * @param {number} [now] epoch ms (defaults to build time)
 * @returns {Set<string>}
 */
export function futureDatedSlugs(articlesDir, now = Date.now()) {
  const slugs = new Set();
  for (const [slug, state] of loadArticleStates(articlesDir)) {
    if (isFutureDated(state, now)) slugs.add(slug);
  }
  return slugs;
}

/**
 * Extract a decoded blog post slug from a full page URL, or null if the URL is
 * not an individual blog post (the /blog/ index and non-blog URLs return null).
 * @param {string} url
 * @returns {string | null}
 */
export function blogSlugFromUrl(url) {
  let path;
  try {
    path = new URL(url).pathname;
  } catch {
    path = String(url);
  }
  const m = path.match(/^\/blog\/(.+?)\/?$/);
  if (!m) return null;
  // Content ids are decoded (e.g. "café"); the URL path is percent-encoded.
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}
