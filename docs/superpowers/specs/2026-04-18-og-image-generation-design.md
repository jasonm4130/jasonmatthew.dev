# OG Image Generation System

## Problem

Every page on jasonmatthew.dev shares the same static `og-default.jpg` when posted to LinkedIn, Twitter, or other social platforms. Blog posts and projects have no unique visual identity in social feeds, reducing click-through and engagement.

## Solution

A build-time OG image generation system using Satori + resvg-js that produces unique, branded cards for every page. Replaces the existing Playwright-based asset generation entirely.

## Templates

Three templates, all following the **dark minimal** style:

- Background: `#121212`
- Text: `#f0f0f0`
- Accent: `#e8553d` (coral bar at top)
- Font: Sora (regular + bold, bundled as `.woff`)
- Output: 1200x630px PNG

### Blog Post Template

- Top accent bar (6px coral)
- Top-left: `JASONMATTHEW.DEV` (small, muted)
- Top-right: `Blog` label (coral)
- Center: post title (Sora bold, large)
- Below title: formatted date (muted)
- Bottom: tag pills (dark bg, coral text)

### Project Template

- Same structure as blog
- Top-right: `Project` label
- Below title: project description (muted)
- Bottom: technology badges instead of tags

### Default Template

- Branded card for homepage and static pages
- Signature/monogram, subtitle "Engineering Manager & Builder"
- Replaces current `og-default.jpg`

## Architecture

### Generation Script

`scripts/generate-og-images.ts` — single script that:

1. Reads all MDX content from `packages/content/` (articles, projects, pages) using `gray-matter` for frontmatter parsing
2. Selects template based on collection type
3. Renders to SVG via Satori, converts to PNG via `@resvg/resvg-js`
4. Outputs to `apps/web/public/og/<collection>/<slug>.png`
5. Generates static assets (favicons, apple-touch-icon, og-default) — replacing `scripts/generate-assets.mjs`

Template files live in `scripts/og-templates/` — one file per template. Font files in `scripts/og-templates/fonts/`.

### Dependencies

**Added:**
- `satori` — JSX-like markup to SVG
- `@resvg/resvg-js` — SVG to PNG
- `gray-matter` — frontmatter parsing

**Removed:**
- `playwright` (or `@playwright/test`) — no longer needed

### Astro Integration

**BaseHead.astro** updated to auto-resolve OG image from current URL:

- `/blog/my-post` → `/og/blog/my-post.png`
- `/projects/pipespy` → `/og/projects/pipespy.png`
- `/` and static pages → `/og/default.png`
- Falls back to `/og/default.png` if resolved path doesn't exist
- The existing `image` prop still works as a manual override

No changes to content schemas or frontmatter required.

### Build Pipeline

**Turborepo task dependency:** OG generation runs before Astro build.

```
pnpm generate:og    # standalone command
pnpm build          # runs generate:og first via Turborepo dependency
```

### Pre-commit Hook

A pre-commit hook detects changes in `packages/content/` and runs `pnpm generate:og` if content files have changed, staging any new/modified OG images automatically. This prevents pushing content without corresponding OG images.

### Git Strategy

Generated images are committed to git:

- Keeps Cloudflare Pages build simple (just Astro, no Satori in CI)
- Enables visual diffing of OG changes in PRs
- Trade-off: a few extra files in git (small PNGs)

## Cleanup

- Remove `scripts/generate-assets.mjs`
- Remove Playwright dependency from `package.json`
- Existing static assets in `public/` (`og-default.jpg`, favicons) replaced by generated equivalents

## Fallback Behaviour

If a per-page OG image is missing (e.g., new post without regeneration), `BaseHead.astro` falls back to `/og/default.png`. No page ever has a broken or missing OG meta tag.
