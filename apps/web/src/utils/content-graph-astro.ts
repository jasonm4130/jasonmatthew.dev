// Collection-backed adapter for the notebook content graph. This is the piece
// that bridges Astro's `getCollection` to the pure resolver/validator in
// content-graph.ts: it reads the blog + project collections, normalizes each
// entry into a display-ready `ResolvedEntry`, runs the same fail-closed
// referential-integrity check the build gate runs (defense-in-depth), and hands
// pages a small set of query helpers.
//
// It imports `astro:content`, so — unlike content-graph.ts — it is page-only and
// must NOT be imported from astro.config.mjs (that path uses content-graph-fs.mjs).
// The `/writing/<id>` article href is constructed here, the single place the
// renamed route is built for graph rendering.
import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './data-utils';
import {
  validateContentGraph,
  seriesEntries,
  seriesAdjacent,
  type GraphEntry,
  type RelatedLink,
} from './content-graph';
import { THREAD_SLUGS, THREADS, getThread, type Thread } from '@data/threads';

export interface ResolvedEntry extends GraphEntry {
  publishDate: Date;
  updatedDate?: Date;
  /** Routable URL — `/writing/<id>` for articles, `/projects/<id>` for projects. */
  href: string;
  /** Serif standfirst: article excerpt or project description. */
  summary: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  sortOrder?: number;
}

function fromArticle(entry: CollectionEntry<'blog'>): ResolvedEntry {
  return {
    id: entry.id,
    collection: 'blog',
    title: entry.data.title,
    threads: entry.data.threads,
    kind: entry.data.kind,
    series: entry.data.series,
    seriesOrder: entry.data.seriesOrder,
    related: entry.data.related as RelatedLink[] | undefined,
    published: isPublished(entry),
    publishDate: entry.data.publishDate,
    updatedDate: entry.data.updatedDate,
    href: `/writing/${entry.id}`,
    summary: entry.data.excerpt,
    technologies: [],
    featured: entry.data.featured,
  };
}

function fromProject(entry: CollectionEntry<'projects'>): ResolvedEntry {
  return {
    id: entry.id,
    collection: 'projects',
    title: entry.data.title,
    threads: entry.data.threads,
    related: entry.data.related as RelatedLink[] | undefined,
    published: isPublished(entry),
    publishDate: entry.data.publishDate,
    href: `/projects/${entry.id}`,
    summary: entry.data.description,
    technologies: entry.data.technologies,
    liveUrl: entry.data.liveUrl,
    githubUrl: entry.data.githubUrl,
    featured: entry.data.featured,
    sortOrder: entry.data.sortOrder,
  };
}

const byDateDesc = (a: ResolvedEntry, b: ResolvedEntry) => b.publishDate.getTime() - a.publishDate.getTime();
const bySortOrder = (a: ResolvedEntry, b: ResolvedEntry) => {
  const oa = a.sortOrder ?? Infinity;
  const ob = b.sortOrder ?? Infinity;
  return oa !== ob ? oa - ob : byDateDesc(a, b);
};

export interface ContentGraph {
  /** Every entry, both collections, published + unpublished (graph-complete). */
  all: ResolvedEntry[];
  /** Published articles, newest first. */
  articles: ResolvedEntry[];
  /** Published projects, ordered by sortOrder then date. */
  projects: ResolvedEntry[];
  /** Published members of a thread (articles + projects), newest first. */
  threadMembers(slug: string): ResolvedEntry[];
  /** The other threads an entry cross-lists into, as Thread records (for "also X"). */
  crossThreads(entry: ResolvedEntry, currentSlug: string): Thread[];
  /** Published-member count per thread slug. */
  threadCount(slug: string): number;
  /** Published chapters of a series, in seriesOrder (the article template's chapter list). */
  seriesChapters(name: string): ResolvedEntry[];
  /** Prev/next chapter around an entry within its series; empty if it has none. */
  adjacentInSeries(entry: ResolvedEntry): { prev?: ResolvedEntry; next?: ResolvedEntry };
}

/** Read + resolve the whole content graph for page rendering. Throws (fail-closed)
 * on any referential-integrity violation — the same contract as the build gate. */
export async function getContentGraph(): Promise<ContentGraph> {
  const articleEntries = (await getCollection('blog')).map(fromArticle);
  const projectEntries = (await getCollection('projects')).map(fromProject);
  const all = [...articleEntries, ...projectEntries];

  validateContentGraph(all, THREAD_SLUGS);

  const articles = articleEntries.filter((e) => e.published).sort(byDateDesc);
  const projects = projectEntries.filter((e) => e.published).sort(bySortOrder);

  return {
    all,
    articles,
    projects,
    threadMembers(slug) {
      // Newest first, mixed collections. Callers that need the projects in
      // sortOrder use the pre-sorted `projects` list filtered by thread instead.
      return all.filter((e) => e.published && e.threads.includes(slug)).sort(byDateDesc);
    },
    crossThreads(entry, currentSlug) {
      return entry.threads
        .filter((t) => t !== currentSlug)
        .map(getThread)
        .filter((t): t is Thread => t != null);
    },
    threadCount(slug) {
      return all.filter((e) => e.published && e.threads.includes(slug)).length;
    },
    seriesChapters(name) {
      // `all` entries are ResolvedEntry; seriesEntries preserves them, narrowing only
      // the static type back to GraphEntry, so the generic keeps ResolvedEntry here.
      return seriesEntries(name, all);
    },
    adjacentInSeries(entry) {
      if (!entry.series) return {};
      return seriesAdjacent(entry.series, entry, all);
    },
  };
}

/** The threads in display order — re-exported so pages import one module. */
export { THREADS, getThread };
