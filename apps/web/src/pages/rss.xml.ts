import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteConfig from '@data/site-config';
import { sortItemsByDateDesc } from '@utils/data-utils';

export async function GET(context: { site: string }) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sorted = posts.sort(sortItemsByDateDesc);

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}`,
    })),
  });
}
