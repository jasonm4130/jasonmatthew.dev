import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, isFutureDated, isPublished, blogSlugFromUrl } from './article-publish.mjs';

// Fixed reference points (Date.now() is not used in tests).
const NOW = new Date('2026-07-18T00:00:00Z').getTime();
const FUTURE = { draft: false, publishDate: new Date('2026-08-01T00:00:00Z') };
const PAST = { draft: false, publishDate: new Date('2026-07-01T00:00:00Z') };

test('parseFrontmatter reads draft + publishDate (LF)', () => {
  const { draft, publishDate } = parseFrontmatter('---\ntitle: X\npublishDate: 2026-08-01\ndraft: true\n---\n\nBody');
  assert.equal(draft, true);
  assert.equal(publishDate.getTime(), new Date('2026-08-01T00:00:00Z').getTime());
});

test('parseFrontmatter reads quoted publishDate and CRLF', () => {
  const { draft, publishDate } = parseFrontmatter("---\r\ntitle: X\r\npublishDate: '2026-08-01'\r\n---\r\n\r\nBody");
  assert.equal(draft, false); // no draft field → not a draft
  assert.equal(publishDate.getTime(), new Date('2026-08-01T00:00:00Z').getTime());
});

test('parseFrontmatter preserves a timestamped publishDate (matches Zod coercion)', () => {
  const { publishDate } = parseFrontmatter("---\npublishDate: '2026-08-01T23:59:00Z'\n---\nx");
  assert.equal(publishDate.toISOString(), '2026-08-01T23:59:00.000Z');
});

test('parseFrontmatter ignores a YAML inline comment on publishDate', () => {
  const { publishDate } = parseFrontmatter('---\npublishDate: 2026-08-01 # scheduled\n---\nx');
  assert.equal(publishDate.getTime(), new Date('2026-08-01T00:00:00Z').getTime());
});

test('isPublished: draft is never published', () => {
  assert.equal(isPublished({ draft: true, publishDate: new Date('2020-01-01') }, NOW), false);
});

test('isPublished: past date is published, future date is not', () => {
  assert.equal(isPublished(PAST, NOW), true);
  assert.equal(isPublished(FUTURE, NOW), false);
});

test('isPublished: a non-draft with no date is published', () => {
  assert.equal(isPublished({ draft: false, publishDate: null }, NOW), true);
});

test('isFutureDated: non-draft future post is scheduled', () => {
  assert.equal(isFutureDated(FUTURE, NOW), true);
});

test('isFutureDated respects intraday time (build earlier the same day)', () => {
  const fm = { draft: false, publishDate: new Date('2026-08-01T23:59:00Z') };
  const buildEarlier = new Date('2026-08-01T00:00:00Z').getTime();
  assert.equal(isFutureDated(fm, buildEarlier), true);
});

test('blogSlugFromUrl decodes percent-encoded slugs to match content ids', () => {
  assert.equal(blogSlugFromUrl('https://jasonmatthew.dev/blog/caf%C3%A9/'), 'café');
});

test('isFutureDated: past-dated non-draft is not scheduled', () => {
  assert.equal(isFutureDated(PAST, NOW), false);
});

test('isFutureDated: draft (even future) is not scheduled', () => {
  assert.equal(isFutureDated({ ...FUTURE, draft: true }, NOW), false);
});

test('isFutureDated: missing publishDate is not scheduled', () => {
  assert.equal(isFutureDated({ draft: false, publishDate: null }, NOW), false);
});

test('blogSlugFromUrl extracts a post slug', () => {
  assert.equal(blogSlugFromUrl('https://jasonmatthew.dev/blog/rag-eval-harness/'), 'rag-eval-harness');
});

test('blogSlugFromUrl returns null for the blog index and non-blog URLs', () => {
  assert.equal(blogSlugFromUrl('https://jasonmatthew.dev/blog/'), null);
  assert.equal(blogSlugFromUrl('https://jasonmatthew.dev/projects/skopia/'), null);
});

test('blogSlugFromUrl returns the numeric slug for pagination pages', () => {
  // Pagination pages resolve to a numeric "slug"; the filter still works because
  // no real post is numeric, so these are never in the scheduled set.
  assert.equal(blogSlugFromUrl('https://jasonmatthew.dev/blog/2/'), '2');
});
