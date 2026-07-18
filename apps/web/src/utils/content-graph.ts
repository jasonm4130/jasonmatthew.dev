// Shared resolver + referential-integrity validator for the notebook content
// graph (threads, series, related cross-links). Pure functions over a normalized
// GraphEntry[] — NO runtime `astro:content` import — so this module is safe to
// import from astro.config.mjs (the build-time gate) as well as from pages and
// unit tests. The collection-backed adapter that calls getCollection() lives with
// the page code that renders the graph.
//
// Fail-closed by design: Astro 5's reference() no longer validates existence at
// build time (it silently yields undefined), so cross-entry integrity is enforced
// here and throws — a broken thread slug, a gapped series, or a related link to a
// missing/unpublished entry fails the build rather than shipping a dead surface.

export interface RelatedLink {
  label: string;
  href: string;
}

export interface GraphEntry {
  /** Astro content id / slug. */
  id: string;
  collection: 'blog' | 'projects';
  title: string;
  threads: string[];
  /** Articles only. */
  kind?: string;
  series?: string;
  seriesOrder?: number;
  related?: RelatedLink[];
  /** Result of the publish-visibility check (draft + scheduling aware). */
  published: boolean;
}

/** Maps an internal article or project href to its target collection + id, or null
 * for external / unrecognised hrefs (left unvalidated). Articles live at `/blog/`
 * — the only article route in this revision. The gate validates against the ACTIVE
 * route set on purpose: a `/blog/<missing>` link fails closed, and a not-yet-routable
 * `/writing/<id>` link is NOT quietly accepted (it would pass the graph check but
 * 404). The /blog -> /writing rename in a later stage swaps this prefix and the
 * related records together, so the parser always matches what actually routes. */
export function parseInternalHref(href: string): { collection: 'blog' | 'projects'; id: string } | null {
  // Strip a query/fragment first: `/blog/foo#section` and `/projects/foo?ref=x`
  // still target the entry `foo`, so they must be validated, not waved through as
  // "external" — the entry either exists or the whole link is dead.
  const path = href.split(/[?#]/)[0];
  const m = path.match(/^\/(blog|projects)\/([^/]+)\/?$/);
  if (!m) return null;
  const id = decodeURIComponent(m[2]);
  return { collection: m[1] === 'projects' ? 'projects' : 'blog', id };
}

class ContentGraphError extends Error {
  constructor(message: string) {
    super(`Content graph integrity check failed: ${message}`);
    this.name = 'ContentGraphError';
  }
}

/**
 * Throws on any referential-integrity violation across the whole content graph:
 *   1. a `threads` slug absent from the controlled vocabulary
 *   2. a `series`/`seriesOrder` pairing that is incomplete, duplicated or gapped
 *   3. a `related` link to an internal entry that is missing or unpublished
 * Returns void on success. Callers (build gate, pages) treat a throw as a hard
 * build failure.
 */
export function validateContentGraph(entries: GraphEntry[], threadSlugs: ReadonlySet<string>): void {
  const byKey = new Map(entries.map((e) => [`${e.collection}:${e.id}`, e]));

  // 1. thread slugs
  for (const entry of entries) {
    for (const slug of entry.threads) {
      if (!threadSlugs.has(slug)) {
        throw new ContentGraphError(
          `${entry.collection}/${entry.id} references unknown thread "${slug}" — add it to src/data/threads.ts or fix the slug.`,
        );
      }
    }
  }

  // 2. series contiguity
  const series = new Map<string, GraphEntry[]>();
  for (const entry of entries) {
    const hasName = entry.series != null;
    const hasOrder = entry.seriesOrder != null;
    if (hasName !== hasOrder) {
      throw new ContentGraphError(
        `${entry.collection}/${entry.id} must set both series and seriesOrder together (got series=${String(
          entry.series,
        )}, seriesOrder=${String(entry.seriesOrder)}).`,
      );
    }
    if (hasName) {
      const list = series.get(entry.series!) ?? [];
      list.push(entry);
      series.set(entry.series!, list);
    }
  }
  for (const [name, members] of series) {
    const orders = members.map((m) => m.seriesOrder!).sort((a, b) => a - b);
    orders.forEach((order, i) => {
      if (order !== i + 1) {
        throw new ContentGraphError(
          `series "${name}" has a duplicate or gapped seriesOrder: expected a contiguous 1..${
            members.length
          }, got [${orders.join(', ')}].`,
        );
      }
    });
  }

  // 3. related cross-links
  for (const entry of entries) {
    for (const link of entry.related ?? []) {
      const target = parseInternalHref(link.href);
      if (!target) continue; // external / non-entry link — not our contract
      const found = byKey.get(`${target.collection}:${target.id}`);
      if (!found) {
        throw new ContentGraphError(
          `${entry.collection}/${entry.id} has a related link to "${link.href}" but no such entry exists.`,
        );
      }
      if (!found.published) {
        throw new ContentGraphError(
          `${entry.collection}/${entry.id} has a related link to "${link.href}" which is not published — drop the link or publish the target.`,
        );
      }
    }
  }
}

/** Published entries belonging to a thread, newest first. Members carry their own
 * threads so a caller can mark cross-listed pieces. */
export function threadEntries(slug: string, entries: GraphEntry[]): GraphEntry[] {
  return entries.filter((e) => e.published && e.threads.includes(slug));
}

/** The published, order-sorted chapters of a series. */
export function seriesEntries(name: string, entries: GraphEntry[]): GraphEntry[] {
  return entries
    .filter((e) => e.published && e.series === name)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}
