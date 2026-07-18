import { defineConfig, fontProviders } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkDirective from 'remark-directive';
import { fileURLToPath } from 'node:url';
import remarkRewriteDraftLinks from './src/plugins/remark-rewrite-draft-links.mjs';
import remarkReadingTime from './src/plugins/remark-reading-time.mjs';
import remarkCallouts from './src/plugins/remark-callouts.mjs';
import remarkSidenotes from './src/plugins/remark-sidenotes.mjs';
import { kryptonThemes } from './src/lib/krypton-theme.ts';
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
    // Expressive Code MUST precede mdx() — it registers the code-block renderer the
    // markdown pipeline then uses. Replaces plain Shiki site-wide with the warm
    // "Krypton" theme; frames/copy/line-highlight/diff styled to the notebook system
    // (single coral accent — no green/red diff). Themes switch via [data-theme=…] to
    // stay in lockstep with global.css's tri-state.
    expressiveCode({
      themes: kryptonThemes,
      themeCssSelector: (theme) => `:root[data-theme='${theme.name}']`,
      useDarkModeMediaQuery: true,
      useThemedScrollbars: false,
      useThemedSelectionColors: false,
      styleOverrides: {
        borderRadius: '0',
        borderColor: 'var(--border)',
        borderWidth: '1px',
        codeBackground: 'var(--code-bg)',
        codeFontFamily: 'var(--font-mono-code)',
        codeFontSize: '0.85rem',
        codeLineHeight: '1.75',
        uiFontFamily: 'var(--font-mono)',
        frames: {
          frameBoxShadowCssValue: 'none',
          editorTabBarBackground: 'var(--code-bg)',
          editorActiveTabBackground: 'var(--code-bg)',
          editorActiveTabForeground: 'var(--muted)',
          editorActiveTabBorderColor: 'transparent',
          editorActiveTabIndicatorTopColor: 'transparent',
          editorActiveTabIndicatorBottomColor: 'transparent',
          editorTabBarBorderBottomColor: 'var(--border)',
          terminalTitlebarBackground: 'var(--code-bg)',
          terminalTitlebarForeground: 'var(--muted)',
          terminalTitlebarBorderBottomColor: 'var(--border)',
          tooltipSuccessBackground: 'var(--coral)',
        },
        textMarkers: {
          markBackground: 'color-mix(in srgb, var(--coral) 9%, transparent)',
          markBorderColor: 'var(--coral)',
          insBackground: 'color-mix(in srgb, var(--coral) 9%, transparent)',
          insBorderColor: 'var(--coral)',
          insDiffIndicatorColor: 'var(--coral)',
          delBackground: 'color-mix(in srgb, var(--faint) 12%, transparent)',
          delBorderColor: 'var(--faint)',
          delDiffIndicatorColor: 'var(--faint)',
        },
      },
    }),
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
      {
        // The code face — Krypton, the "mechanical" Monaspace member. Same OFL 1.1
        // family as Neon; used only by article/project code frames + inline `code`.
        provider: fontProviders.fontsource(),
        name: 'Monaspace Krypton',
        cssVariable: '--font-mono-krypton',
        weights: [400, 700],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['ui-monospace', 'monospace'],
      },
    ],
  },
  markdown: {
    // Order matters: remark-directive parses `:::` syntax that remark-callouts then
    // remaps; remark-sidenotes rewrites GFM footnotes into gutter margin notes;
    // reading-time counts words last.
    remarkPlugins: [remarkDirective, remarkCallouts, remarkRewriteDraftLinks, remarkSidenotes, remarkReadingTime],
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
    // Code highlighting is owned by Expressive Code (integration above), not Shiki —
    // no `shikiConfig` here.
  },
});
