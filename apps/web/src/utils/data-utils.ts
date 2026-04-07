import type { CollectionEntry } from 'astro:content';

export function isPublished({ data }: { data: { draft?: boolean; publishDate: Date } }) {
  return !data.draft && data.publishDate <= new Date();
}

export function sortItemsByDateDesc(itemA: { data: { publishDate: Date } }, itemB: { data: { publishDate: Date } }) {
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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
