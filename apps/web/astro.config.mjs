import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://jasonmatthew.dev',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [mdx(), sitemap()],
  image: {
    layout: 'constrained',
    responsiveStyles: false,
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
