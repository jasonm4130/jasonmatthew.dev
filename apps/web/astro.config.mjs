import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { fileURLToPath } from 'node:url';
import remarkRewriteDraftLinks from './src/plugins/remark-rewrite-draft-links.mjs';
import remarkReadingTime from './src/plugins/remark-reading-time.mjs';
import { futureDatedSlugs, blogSlugFromUrl } from './src/utils/article-publish.mjs';
import { readContentGraph } from './src/utils/content-graph-fs.mjs';
import { validateContentGraph } from './src/utils/content-graph.ts';
import { THREAD_SLUGS } from './src/data/threads.ts';

// Scheduled posts (draft:false but future-dated) keep a live /blog/<slug>/ page
// for OG-image generation + in-situ review, but must stay out of the sitemap.
const articlesDir = fileURLToPath(new URL('../../packages/content/articles', import.meta.url));
const projectsDir = fileURLToPath(new URL('../../packages/content/projects', import.meta.url));
const scheduledSlugs = futureDatedSlugs(articlesDir);

// Fail-closed content-graph gate. Runs on every build path (astro check + astro
// build both load this config), so a broken thread slug, gapped series or dead
// related cross-link fails the build here rather than shipping an empty surface —
// the guard against Astro 5's silently-undefined reference() regression.
validateContentGraph(readContentGraph(articlesDir, projectsDir), THREAD_SLUGS);

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
  // Self-host all three brand faces at build (copied to _astro/fonts) via the
  // Fontsource provider — zero runtime third-party font requests, automatic
  // preload links + metric-matched fallbacks for zero CLS. All SIL OFL 1.1.
  // Still `experimental.fonts` in Astro 5.18; the `cssVariable`s are consumed
  // by src/styles/global.css (--font-sans/-serif/-mono resolve to these).
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Sora',
        cssVariable: '--font-sora',
        weights: [400, 600, 700],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['system-ui', 'sans-serif'],
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Libre Baskerville',
        cssVariable: '--font-libre',
        weights: [400, 700],
        styles: ['normal', 'italic'],
        subsets: ['latin'],
        fallbacks: ['Georgia', 'serif'],
      },
      {
        provider: fontProviders.fontsource(),
        name: 'Monaspace Neon',
        cssVariable: '--font-mono-neon',
        weights: [400, 700],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['ui-monospace', 'monospace'],
      },
    ],
  },
  markdown: {
    remarkPlugins: [remarkRewriteDraftLinks, remarkReadingTime],
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
