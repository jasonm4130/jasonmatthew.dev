# jasonmatthew.dev — Project Guidelines

## Project Purpose

Personal portfolio and blog for Jason Matthew, Engineering Manager at Squiz. Built with Astro on Cloudflare Pages. Monorepo managed by Turborepo + pnpm.

## Monorepo Structure

```
apps/web/          — Astro site (Tailwind v4, MDX, Shiki)
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
- **Fonts**: Sora (headings) + Libre Baskerville (body) + Monaspace Neon (code)
- **Deploy**: Cloudflare Pages (static output)
- **Monorepo**: Turborepo + pnpm workspaces

## Design Tokens

- Light: bg `#faf8f5`, fg `#111111`, accent `#e8553d`
- Dark: bg `#121212`, fg `#f0f0f0`, accent `#e8553d`
- Single accent colour (coral) used for links, highlights, interactive elements
- Monochrome base with the coral as the only colour

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
