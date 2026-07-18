// Build-time disk reader for the content graph. Reads every article + project
// frontmatter into the normalized GraphEntry shape that content-graph.ts's
// validator consumes, computing `published` from the same publish-state SSOT the
// sitemap + draft-link plugin use. Runs in astro.config.mjs (top-level), where the
// astro:content API is unavailable — so it reads the files directly, like
// article-publish.mjs. gray-matter is an explicit apps/web dependency.
//
// Keep the normalized shape in step with content-graph.ts's GraphEntry and with
// the collection-backed adapter the pages use.
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, sep } from 'node:path';
import matter from 'gray-matter';
import { isPublished } from './article-publish.mjs';

/** @param {unknown} value @returns {Date | null} */
function toDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * @param {string} dir absolute path to a content collection dir
 * @param {'blog' | 'projects'} collection
 * @param {number} now epoch ms
 * @returns {import('./content-graph.ts').GraphEntry[]}
 */
function readCollection(dir, collection, now) {
  let names;
  try {
    names = readdirSync(dir, { recursive: true });
  } catch {
    return [];
  }
  const entries = [];
  for (const name of names) {
    const ext = extname(String(name));
    if (ext !== '.md' && ext !== '.mdx') continue;
    const id = String(name).slice(0, -ext.length).split(sep).join('/');
    const { data } = matter(readFileSync(join(dir, String(name)), 'utf8'));
    entries.push({
      id,
      collection,
      title: typeof data.title === 'string' ? data.title : id,
      threads: Array.isArray(data.threads) ? data.threads.map(String) : [],
      kind: typeof data.kind === 'string' ? data.kind : undefined,
      series: typeof data.series === 'string' ? data.series : undefined,
      seriesOrder: typeof data.seriesOrder === 'number' ? data.seriesOrder : undefined,
      related: Array.isArray(data.related) ? data.related : undefined,
      published: isPublished({ draft: data.draft === true, publishDate: toDate(data.publishDate) }, now),
    });
  }
  return entries;
}

/**
 * Read the whole content graph from disk as normalized GraphEntry[].
 * @param {string} articlesDir absolute path to packages/content/articles
 * @param {string} projectsDir absolute path to packages/content/projects
 * @param {number} [now] epoch ms (defaults to build time)
 */
export function readContentGraph(articlesDir, projectsDir, now = Date.now()) {
  return [...readCollection(articlesDir, 'blog', now), ...readCollection(projectsDir, 'projects', now)];
}
