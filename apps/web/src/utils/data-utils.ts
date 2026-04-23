import type { CollectionEntry } from 'astro:content';

export function isNotDraft({ data }: { data: { draft?: boolean } }) {
  return !data.draft;
}

// Brisbane is UTC+10 year-round (no DST). publishDate in frontmatter is a bare
// date that Zod coerces to UTC midnight, but authors mean "midnight AEST of
// that day" — so shift "now" forward by the offset when comparing.
const BRISBANE_OFFSET_MS = 10 * 60 * 60 * 1000;

export function isPublished({ data }: { data: { draft?: boolean; publishDate: Date } }) {
  return (
    !data.draft && (import.meta.env.DEV || data.publishDate.getTime() <= Date.now() + BRISBANE_OFFSET_MS)
  );
}

export function sortItemsByDateDesc(itemA: { data: { publishDate: Date } }, itemB: { data: { publishDate: Date } }) {
  return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
}

export function sortItemsBySortOrder(
  itemA: { data: { sortOrder?: number; publishDate: Date } },
  itemB: { data: { sortOrder?: number; publishDate: Date } },
) {
  const orderA = itemA.data.sortOrder ?? Infinity;
  const orderB = itemB.data.sortOrder ?? Infinity;
  if (orderA !== orderB) return orderA - orderB;
  return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
}

export function getAllTags(posts: CollectionEntry<'blog'>[]) {
  const tags = new Map<string, number>();
  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    });
  });
  return tags;
}

export function getPostsByTag(posts: CollectionEntry<'blog'>[], tag: string) {
  return posts.filter((post) => post.data.tags.includes(tag));
}
