# jasonmatthew.dev — Project Guidelines

## Project Purpose

Personal portfolio and blog for Jason Matthew, Principal Engineer & Engineering Manager at Squiz. Built with Astro on Cloudflare Pages. Monorepo managed by Turborepo + pnpm.

## Monorepo Structure

```
apps/web/          — Astro site (Tailwind v4, MDX, Expressive Code)
packages/content/  — MDX content (articles, projects, pages)
```

## Key Commands

```bash
pnpm install                       # Install all workspace dependencies
pnpm dev                           # Start Astro dev server (turbo)
pnpm build                         # Build all packages (turbo)
pnpm typecheck                     # TypeScript checking
pnpm format                        # Prettier format
pnpm -F @jasonmatthew/web dev      # Dev server for web app only
pnpm -F @jasonmatthew/web build    # Build web app only
pnpm -F @jasonmatthew/web preview  # Preview production build
```

## Tech Stack

- **Framework**: Astro 5 (Node 22+)
- **Styling**: Tailwind CSS v4 via @tailwindcss/vite
- **Content**: MDX with Zod-validated schemas
- **Fonts**: Sora (headings) + Libre Baskerville (body) + Monaspace Neon (UI/annotation
  mono) + Monaspace Krypton (code) — all self-hosted via the Astro Fonts API
- **Code highlighting**: Expressive Code (`astro-expressive-code`, registered before
  `mdx()`) with the self-hosted Krypton theme in `apps/web/src/lib/krypton-theme.ts`
- **Deploy**: Cloudflare Pages (static output)
- **Monorepo**: Turborepo + pnpm workspaces

## Design Tokens

Annotated-notebook palette. Raw values live on `:root` / `[data-theme='dark']` in
`apps/web/src/styles/global.css` (with a `@media (prefers-color-scheme: dark)` twin
for no-choice visitors), re-exported to Tailwind via `@theme inline`. Theming is by
the `data-theme` attribute, not a `.dark` class.

- Light: paper `#f4efe4`, ink `#100d06`, coral `#b83c1c` (AA-safe on paper, 4.95:1)
- Dark: paper `#191611`, ink `#ece6d9`, coral `#ee6547` (5.66:1 on dark paper)
- Support tokens: `--body2`, `--muted`, `--faint`, `--hair`, `--border`, `--surface`
- Back-compat aliases `--color-bg/-fg/-accent/-muted/-border/-surface` map onto the
  notebook vars, so components need no changes when the palette shifts
- Single coral accent per theme (links, highlights, interactive) on a monochrome base;
  `scripts/check-contrast.mjs` fails the build if either coral drops below WCAG AA 4.5:1
- Motion tokens (theme-independent, on `:root`): `--dur-1/-2/-3` (120/180/300ms) +
  `--ease-out`/`--ease-standard`. One shared vocabulary for the travelling title
  (shared `view-transition-name`) and crafted link underline; every path has a
  `prefers-reduced-motion` guard. Full reference in `docs/design-system.md` § Motion

## Code Standards

- TypeScript strict mode
- Zod validation on content schemas (import from `astro/zod`)
- Conventional commits: `feat:`, `fix:`, `docs:`, `content:`, `style:`, `refactor:`, `chore:`
- Prettier for formatting (see .prettierrc)
- No `any` types, no `@ts-ignore`
- All components are `.astro` files — no React/Vue/Svelte

## Content Conventions

- Blog posts in `packages/content/articles/*.mdx`
- Projects in `packages/content/projects/*.mdx`
- Static pages in `packages/content/pages/*.mdx`
- All content requires frontmatter matching Zod schemas in `apps/web/src/content.config.ts`
- Use `draft: true` to hide content from production builds
- Dates in ISO 8601 format (YYYY-MM-DD)
- Tags are lowercase, hyphenated (e.g., `engineering-management`)
- **Content graph (notebook IA):** articles + projects carry `threads: string[]`
  (durable topic areas, multi-membership); articles also carry `kind`
  (`essay`/`buildlog`/`incident`/`architecture`, default `essay`), an optional
  ordered `series`/`seriesOrder` arc, and `related` cross-links. Projects add
  `related` + optional `metrics`. Thread slugs are a controlled vocabulary in
  `apps/web/src/data/threads.ts` — the single source for thread titles/blurbs/order.
- **Referential integrity is build-time and fail-closed:** a gate in
  `astro.config.mjs` (via `src/utils/content-graph.ts` + `content-graph-fs.mjs`)
  fails the build on an unknown thread slug, a gapped/duplicate `seriesOrder`, or a
  `related` link to a missing/unpublished entry — guarding Astro 5's silently
  undefined `reference()`. Every new surface reuses the `isPublished` invariant.
- **Article prose furniture** (available in `packages/content/articles/*.mdx`):
  `:::note[Label]` container directives render as a single mono+coral callout aside;
  `[^n]` GFM footnotes render as Tufte margin notes in the article's sidenote gutter
  (renumbered 1..n, no bottom footnotes section). Full authoring reference and Krypton
  code-theme token roles in `docs/design-system.md`.

## Notebook components & tests

- Design-system primitives live in `apps/web/src/components/notebook/*.astro`
  (PageHead, ThreadCard, StreamRow, ThreadPieceRow, NowRow, ProjectRow, KindTag,
  CrossTag, Meta, SectionBand, Breadcrumb, RailNote). Each is class-merge-safe
  (`class:list` + `...rest`) with Astro-scoped `<style>` reading the global tokens.
- Reading time is computed at build by `src/plugins/remark-reading-time.mjs`
  (`minutesRead` on the article frontmatter).
- Tests: `pnpm -F @jasonmatthew/web test` runs Vitest (Astro Container-API component
  tests + the content-graph validator in `apps/web/test/`) plus the
  `article-publish` node:test. `build` depends on `test` in `turbo.json`, and a
  `pr-checks` workflow runs it on PRs, so regressions can't ship silently.

## Page types & routes

- The notebook page types compose the primitives via the collection-backed adapter
  `apps/web/src/utils/content-graph-astro.ts` (`getContentGraph()`): masthead home
  (`/`), writing stream (`/writing/`, `/writing/[id]/`), threads index + per-thread
  (`/threads/`, `/threads/[id]/`), `/now/`, and projects (`/projects/`,
  `/projects/[id]/`). `BaseLayout` takes `width='wide'|'prose'`; wide pages render
  their own `.shell` + `.nb-grid` rail/body scaffolding (in `global.css`).
- **Article reading template** (`writing/[id].astro`, `width='wide'`): a three-zone
  notebook layout — sticky TOC rail (h2 scroll-spy) · serif `.art-prose` column
  (numbered h2s, Expressive Code frames) · sidenote gutter (reserved only when the
  article has `[^n]` footnotes — `remark-sidenotes` sets `hasSidenotes`; without it
  `.art` narrows and centres) — plus a pure-CSS
  reading-progress bar, per-kind header, related-work cards, and thread/series footer
  nav (series nav is dormant until an article sets `series`/`seriesOrder`). The project
  template shares the voice via `.art-prose.case-narrow`. See `docs/design-system.md`.
- **Articles live at `/writing/`, not `/blog/`.** The rename is edge-enforced by
  `apps/web/public/_redirects` (301s: `/blog`→`/writing`, `/blog/*`→`/writing/:splat`,
  plus explicit `/blog/2`+`/projects/2` old-pagination pages → their index so removed
  paginated URLs don't 404); every internal article href is `/writing/<slug>`. The
  `/og/blog/…` OG-image asset dir and `/images/blog/…` content images keep the `blog`
  path — they are asset conventions, not user-facing routes.

## Voice Check

- Invoke the `voice-check` skill before shipping ANY public-facing text (articles, projects, social copy, README/bio text)
- Tier-1 lint: `node scripts/voice-lint.mjs [--social] [--platform x|linkedin] <files>` — exits 1 on BLOCK findings (em-dash, banned lexicon, marketing/influencer phrasing; social mode adds hashtag/emoji/280-weighted checks). Tests: `node --test scripts/voice-lint.test.mjs`
- A PostToolUse hook (`.claude/settings.json`) runs the lint automatically on every Edit/Write to `packages/content/**/*.mdx` and feeds BLOCK findings back — fix by rewriting, never by exempting

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

## Content operations

Article planning, scheduling, pipeline state, and multi-channel distribution are managed **out of this repo** by a private content-ops workspace (local: `~/Work/Git/content-ops`). This repo holds only the published site and its MDX articles. Do not add content calendars, scheduling state, or distribution tooling here — create and track those in content-ops. New articles are drafted via content-ops, which opens PRs here.
