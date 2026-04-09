# jasonmatthew.dev

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fjasonmatthew.dev&style=flat-square)](https://jasonmatthew.dev)
[![Built with Astro](https://img.shields.io/badge/Astro-5-bc52ee?style=flat-square&logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deployed on Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-deployed-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![Scheduled Rebuild](https://img.shields.io/github/actions/workflow/status/jasonm4130/jasonmatthew.dev/scheduled-rebuild.yml?style=flat-square&label=scheduled%20rebuild)](https://github.com/jasonm4130/jasonmatthew.dev/actions/workflows/scheduled-rebuild.yml)

Personal portfolio and blog for [Jason Matthew](https://jasonmatthew.dev) — Engineering Manager from Brisbane, Australia.

## Tech Stack

| Layer     | Tech                                                               |
| --------- | ------------------------------------------------------------------ |
| Framework | [Astro 5](https://astro.build) with TypeScript strict mode         |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Content   | MDX with Zod-validated schemas                                     |
| Fonts     | Sora (headings) + Libre Baskerville (body) + Monaspace Neon (code) |
| Deploy    | [Cloudflare Pages](https://pages.cloudflare.com) (static output)   |
| Monorepo  | [Turborepo](https://turbo.build) + pnpm workspaces                 |
| Quality   | ESLint, Prettier, Husky + lint-staged                              |

## Project Structure

```
apps/web/              Astro site (components, layouts, pages, styles)
packages/content/      MDX content (articles, projects, pages)
```

## Getting Started

**Prerequisites:** Node 22+ and pnpm 10+

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm -F @jasonmatthew/web preview
```

## Other Commands

```bash
pnpm typecheck         # TypeScript checking
pnpm lint              # ESLint
pnpm format            # Prettier format
pnpm format:check      # Prettier check (CI)
```

## License

MIT &mdash; see [LICENSE](LICENSE) for details.
