# jasonmatthew.dev — Project Guidelines

## Build, test & deploy

- **There is no root `test` script** — `pnpm test` fails. Run
  `pnpm -F @jasonmatthew/web test` (Vitest in `apps/web/test/` + the `article-publish`
  node:test) or `turbo test`. `build` depends on `test` in `turbo.json`, so a broken
  test also fails the build and the `pr-checks` workflow.
- Deploy is **Cloudflare Workers static assets** (`apps/web/wrangler.jsonc`,
  `wrangler deploy`), not Cloudflare Pages. Don't reach for `wrangler pages …` or
  Pages-only config.
- `.husky/pre-commit` runs `pnpm generate:og` and then `git add`s the regenerated OG
  images and favicons whenever anything under `packages/content/` is staged. It will
  add files you did not stage — expect it on every content commit, and check
  `git status` before and after.
- Editing a text colour token in `apps/web/src/styles/global.css` can fail the build:
  `scripts/check-contrast.mjs` enforces WCAG AA 4.5:1 for coral/muted/faint against
  paper **and** surface, in both themes. Fix the token, never bypass the gate.
- Referential integrity is build-time and fail-closed (`apps/web/astro.config.mjs` →
  `apps/web/src/utils/content-graph.ts`): an unknown thread slug, a gapped/duplicate
  `seriesOrder`, or a `related` link to a missing/unpublished entry fails the build.
  Every new surface reuses the `isPublished` invariant so drafts can't leak.

## Code

- All components are `.astro` — no React, Vue or Svelte. Don't add a UI framework
  dependency to solve a component problem.

## Content

- `content:` is an in-use commit type here, alongside the conventional set.
- Read `docs/design-system.md` before authoring article MDX — it documents the prose
  furniture (`:::note[Label]` callouts, `[^n]` footnotes rendered as Tufte margin
  notes) and the Krypton code-theme token roles.
- Articles live at `/writing/`, not `/blog/` (301s in `apps/web/public/_redirects`).
  The `/og/blog/…` and `/images/blog/…` asset dirs deliberately keep `blog` — renaming
  them breaks OG images and content images.
