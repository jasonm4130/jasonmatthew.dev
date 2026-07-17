import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { fileURLToPath } from 'node:url';
import remarkRewriteDraftLinks from './src/plugins/remark-rewrite-draft-links.mjs';
import { futureDatedSlugs, blogSlugFromUrl } from './src/utils/scheduled-slugs.mjs';

// Scheduled posts (draft:false but future-dated) keep a live /blog/<slug>/ page
// for OG-image generation + in-situ review, but must stay out of the sitemap.
const articlesDir = fileURLToPath(new URL('../../packages/content/articles', import.meta.url));
const scheduledSlugs = futureDatedSlugs(articlesDir);

export default defineConfig({
  site: 'https://jasonmatthew.dev',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const slug = blogSlugFromUrl(page);
        return !(slug && scheduledSlugs.has(slug));
      },
    }),
  ],
  image: {
    layout: 'constrained',
    responsiveStyles: false,
  },
  markdown: {
    remarkPlugins: [remarkRewriteDraftLinks],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { class: 'heading-anchor', ariaLabel: 'Link to this section' },
          content: {
            type: 'element',
            tagName: 'span',
            properties: { class: 'heading-anchor-icon', ariaHidden: 'true' },
            children: [{ type: 'text', value: '#' }],
          },
        },
      ],
    ],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
