---
name: new-blog-post
description: Create a new blog post with proper frontmatter
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Create a new blog post: $ARGUMENTS

## Steps

1. Read `apps/web/src/content.config.ts` for the blog schema
2. Read a recent post in `packages/content/articles/` for reference
3. Create `packages/content/articles/<slug>.mdx` with frontmatter:
   - title, excerpt, publishDate (today), tags, draft: true
   - Content outline with H2 sections
4. Run `pnpm typecheck` to validate schema conformance
