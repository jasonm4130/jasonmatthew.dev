---
name: new-project
description: Create a new project case study
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Create a new project case study: $ARGUMENTS

## Steps

1. Read `apps/web/src/content.config.ts` for the project schema
2. Read a recent project in `packages/content/projects/` for reference
3. Create `packages/content/projects/<slug>.mdx` with:
   - title, description, publishDate, technologies, featured, liveUrl/githubUrl
   - Sections: Overview, Problem, Solution, Technical Details, Outcome
4. Run `pnpm typecheck` to validate
