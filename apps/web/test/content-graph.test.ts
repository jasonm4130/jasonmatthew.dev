import { describe, it, expect } from 'vitest';
import {
  validateContentGraph,
  parseInternalHref,
  threadEntries,
  seriesEntries,
  seriesAdjacent,
  type GraphEntry,
} from '@utils/content-graph';

const SLUGS: ReadonlySet<string> = new Set(['applied-ai', 'systems']);

function entry(partial: Partial<GraphEntry> & { id: string }): GraphEntry {
  return { collection: 'blog', title: partial.id, threads: [], published: true, ...partial };
}

describe('validateContentGraph', () => {
  it('passes a well-formed graph', () => {
    const entries = [
      entry({ id: 'a', threads: ['applied-ai', 'systems'] }),
      entry({ id: 'b', collection: 'projects', threads: ['systems'] }),
    ];
    expect(() => validateContentGraph(entries, SLUGS)).not.toThrow();
  });

  it('throws on a thread slug absent from the vocabulary', () => {
    const entries = [entry({ id: 'a', threads: ['made-up'] })];
    expect(() => validateContentGraph(entries, SLUGS)).toThrow(/unknown thread "made-up"/);
  });

  it('throws when series is set without seriesOrder (and vice versa)', () => {
    expect(() => validateContentGraph([entry({ id: 'a', series: 's' })], SLUGS)).toThrow(/together/);
    expect(() => validateContentGraph([entry({ id: 'a', seriesOrder: 1 })], SLUGS)).toThrow(/together/);
  });

  it('passes a contiguous series but throws on gaps or duplicates', () => {
    const good = [entry({ id: 'a', series: 's', seriesOrder: 1 }), entry({ id: 'b', series: 's', seriesOrder: 2 })];
    expect(() => validateContentGraph(good, SLUGS)).not.toThrow();

    const gapped = [entry({ id: 'a', series: 's', seriesOrder: 1 }), entry({ id: 'b', series: 's', seriesOrder: 3 })];
    expect(() => validateContentGraph(gapped, SLUGS)).toThrow(/gapped seriesOrder/);

    const duped = [entry({ id: 'a', series: 's', seriesOrder: 1 }), entry({ id: 'b', series: 's', seriesOrder: 1 })];
    expect(() => validateContentGraph(duped, SLUGS)).toThrow(/duplicate or gapped/);
  });

  it('throws on a related link to a missing or unpublished entry', () => {
    const missing = [entry({ id: 'a', related: [{ label: 'x', href: '/projects/nope' }] })];
    expect(() => validateContentGraph(missing, SLUGS)).toThrow(/no such entry/);

    // reverse-gap: a /writing/ article link to a missing post must fail closed too,
    // not slip through as an "external" link (regression guard for the parser fix).
    const missingBlog = [entry({ id: 'a', related: [{ label: 'x', href: '/writing/nope' }] })];
    expect(() => validateContentGraph(missingBlog, SLUGS)).toThrow(/no such entry/);

    // ...and the same must hold when a query/fragment is appended (they target the
    // same entry, so they can't be allowed to bypass the check).
    const missingFrag = [entry({ id: 'a', related: [{ label: 'x', href: '/writing/nope#section' }] })];
    expect(() => validateContentGraph(missingFrag, SLUGS)).toThrow(/no such entry/);

    const unpublished = [
      entry({ id: 'a', related: [{ label: 'x', href: '/writing/b' }] }),
      entry({ id: 'b', published: false }),
    ];
    expect(() => validateContentGraph(unpublished, SLUGS)).toThrow(/not published/);
  });

  it('accepts a related link to a published entry and ignores external links', () => {
    const entries = [
      entry({
        id: 'a',
        related: [
          { label: 'x', href: '/writing/b' },
          { label: 'ext', href: 'https://example.com' },
        ],
      }),
      entry({ id: 'b', published: true }),
    ];
    expect(() => validateContentGraph(entries, SLUGS)).not.toThrow();
  });
});

describe('parseInternalHref', () => {
  it('maps the /writing/ article route to the blog collection', () => {
    expect(parseInternalHref('/writing/foo')).toEqual({ collection: 'blog', id: 'foo' });
  });
  it('resolves the entry even with a query or fragment appended', () => {
    expect(parseInternalHref('/writing/foo#section')).toEqual({ collection: 'blog', id: 'foo' });
    expect(parseInternalHref('/projects/bar?ref=x')).toEqual({ collection: 'projects', id: 'bar' });
  });
  it('maps /projects/<slug> to the projects collection', () => {
    expect(parseInternalHref('/projects/bar/')).toEqual({ collection: 'projects', id: 'bar' });
  });
  it('returns null for non-entry, external, and legacy /blog/ hrefs', () => {
    expect(parseInternalHref('/now')).toBeNull();
    expect(parseInternalHref('https://example.com/writing/x')).toBeNull();
    // Legacy /blog/ no longer routes on-site (Stage C rename → /writing/); a stale
    // in-content /blog/<id> link must fail the graph check, not resolve silently.
    expect(parseInternalHref('/blog/foo')).toBeNull();
  });
});

describe('threadEntries / seriesEntries', () => {
  const entries = [
    entry({ id: 'pub', threads: ['systems'], published: true }),
    entry({ id: 'draft', threads: ['systems'], published: false }),
    entry({ id: 'other', threads: ['applied-ai'], published: true }),
  ];

  it('returns only published members of a thread', () => {
    const ids = threadEntries('systems', entries).map((e) => e.id);
    expect(ids).toEqual(['pub']);
  });

  it('orders series chapters and drops unpublished ones', () => {
    const series = [
      entry({ id: 'two', series: 's', seriesOrder: 2, published: true }),
      entry({ id: 'one', series: 's', seriesOrder: 1, published: true }),
      entry({ id: 'hidden', series: 's', seriesOrder: 3, published: false }),
    ];
    expect(seriesEntries('s', series).map((e) => e.id)).toEqual(['one', 'two']);
  });
});

describe('seriesAdjacent', () => {
  const chapters = [
    entry({ id: 'one', series: 's', seriesOrder: 1 }),
    entry({ id: 'two', series: 's', seriesOrder: 2 }),
    entry({ id: 'three', series: 's', seriesOrder: 3 }),
  ];

  it('returns the neighbouring chapters in reading order', () => {
    const { prev, next } = seriesAdjacent('s', chapters[1], chapters);
    expect(prev?.id).toBe('one');
    expect(next?.id).toBe('three');
  });

  it('has no prev at the first chapter and no next at the last', () => {
    expect(seriesAdjacent('s', chapters[0], chapters).prev).toBeUndefined();
    expect(seriesAdjacent('s', chapters[0], chapters).next?.id).toBe('two');
    expect(seriesAdjacent('s', chapters[2], chapters).next).toBeUndefined();
  });

  it('returns nothing for an entry that is not a published member of the series', () => {
    const hidden = entry({ id: 'hidden', series: 's', seriesOrder: 4, published: false });
    expect(seriesAdjacent('s', hidden, [...chapters, hidden])).toEqual({});
  });
});
