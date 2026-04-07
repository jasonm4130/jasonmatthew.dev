import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import siteConfig from '@data/site-config';
import { isPublished, sortItemsByDateDesc } from '@utils/data-utils';

export async function GET(context: { site: string }) {
  const posts = await getCollection('blog', isPublished);
  const sorted = posts.sort(sortItemsByDateDesc);

  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site,
    customData: '<language>en-au</language>',
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}`,
    })),
  });
}
