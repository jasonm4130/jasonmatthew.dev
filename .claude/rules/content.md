# Content Rules

- All dates in frontmatter use ISO 8601 format (YYYY-MM-DD)
- Excerpts are 1-2 sentences, plain text (no markdown)
- Tags are lowercase, hyphenated (e.g., "engineering-management")
- Draft posts (draft: true) are excluded in production builds
- Scheduled posts (draft: false with a future publishDate) get a live /blog/<slug>/ page for OG-image generation and in-situ review, but are hidden from listings/RSS/homepage and excluded from the sitemap until their date
- Blog posts go in packages/content/articles/
- Projects go in packages/content/projects/
- Static pages go in packages/content/pages/
- Frontmatter must match Zod schemas in apps/web/src/content.config.ts
