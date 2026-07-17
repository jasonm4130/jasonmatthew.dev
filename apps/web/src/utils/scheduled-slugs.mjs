// Build-time helper: which published (draft:false) blog posts are still scheduled
// for a future date. Used by the sitemap filter in astro.config.mjs to keep
// pre-publish posts out of the sitemap while their /blog/<slug>/ page stays live
// for OG-image generation and in-situ review. Dependency-free: it hand-parses the
// two frontmatter fields it needs so it can run in the Astro config, where the
// astro:content API is not available.
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, sep } from 'node:path';

// Keep in sync with BRISBANE_OFFSET_MS in ./data-utils.ts. Authors write a bare
// publishDate meaning "midnight AEST"; Brisbane is UTC+10 year-round (no DST).
const BRISBANE_OFFSET_MS = 10 * 60 * 60 * 1000;

/**
 * Parse the two fields the sitemap filter needs from a frontmatter block.
 * @param {string} raw full file contents
 * @returns {{ draft: boolean, publishDate: Date | null }}
 */
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = m ? m[1] : '';
  const draft = /^draft:\s*true\b/im.test(fm);
  const dateM = fm.match(/^publishDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
  const publishDate = dateM ? new Date(`${dateM[1]}T00:00:00Z`) : null;
  return { draft, publishDate };
}

/**
 * A post is "scheduled" (not yet public) when it is not a draft but its
 * publishDate is still in the future — the negation of isPublished() in data-utils.ts.
 * @param {{ draft: boolean, publishDate: Date | null }} fm
 * @param {number} now epoch ms
 */
export function isFutureDated({ draft, publishDate }, now) {
  return !draft && publishDate != null && publishDate.getTime() > now + BRISBANE_OFFSET_MS;
}

/**
 * Extract a blog post slug from a full page URL, or null if it is not an
 * individual blog post URL (the /blog/ index and non-blog URLs return null).
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
  return m ? m[1] : null;
}

/**
 * Read the articles directory and return the set of slugs (Astro content ids)
 * that are non-draft but future-dated.
 * @param {string} articlesDir absolute path to packages/content/articles
 * @param {number} [now] epoch ms (defaults to build time)
 * @returns {Set<string>}
 */
export function futureDatedSlugs(articlesDir, now = Date.now()) {
  const slugs = new Set();
  let entries;
  try {
    entries = readdirSync(articlesDir, { recursive: true });
  } catch {
    return slugs; // no articles dir → nothing scheduled
  }
  for (const name of entries) {
    const ext = extname(name);
    if (ext !== '.md' && ext !== '.mdx') continue;
    const raw = readFileSync(join(articlesDir, name), 'utf8');
    if (isFutureDated(parseFrontmatter(raw), now)) {
      slugs.add(name.slice(0, -ext.length).split(sep).join('/')); // Astro id uses '/'
    }
  }
  return slugs;
}
