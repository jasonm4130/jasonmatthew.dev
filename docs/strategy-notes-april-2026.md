# Strategy Notes — April 2026

> Notes on aligning jasonmatthew.dev with the updated career positioning. The Obsidian vault (`~/Documents/Obsidian Vault/`) has the full job search strategy; this doc captures what needs to change on the site.

## Context

Career positioning has shifted from "Engineering Manager" to "Principal Contributor & Engineering Manager" — leading with technical depth, keeping management as secondary signal. Full strategy docs live in the Obsidian vault under `Projects/Job Hunting/`.

Key docs to reference:

- `Projects/Job Hunting/Public Narrative.md` — recruiter/panel-safe narrative
- `Areas/Professional/Career Resilience/Resume.md` — rewritten for dual-track
- `Areas/Professional/Career Resilience/LinkedIn/LinkedIn Profile Update - April 2026.md` — LinkedIn copy

## What needs to change on jasonmatthew.dev

### About page (`packages/content/pages/about.mdx`)

Current framing: "I'm an Engineering Manager... I lead three AI teams..."
New framing should match the resume/LinkedIn: lead with building, not managing.

Suggested rewrite direction:

- Open with what you build, not who you manage
- "Principal Contributor & Engineering Manager" not just "Engineering Manager"
- Lead with Conversational Search, Content Readiness, S3 Vectors — the technical work
- Keep the "Lead by Example" section but reframe as "I chose EM to learn org-level change; I drive the most value through architecture and code"
- North star: work that reaches beyond one company — open source, tools, teaching
- Side projects section is already good — keep it

### Resume page (NEW — does not exist yet)

Consider adding a `/resume` route that renders the markdown resume. Options:

- Render `Resume.md` as an Astro page with custom styling (keeps it in sync with vault copy)
- Use the site's existing Tailwind + typography setup for a clean, on-brand resume layout
- Add a "Download PDF" link (rendered via LapisCV or Resumx from the same markdown source)

### Blog content alignment

Existing articles lean heavily on management topics ("The 1:1 That Actually Changed Something", "Writing the Performance Review You'd Want to Receive"). Future content should include more technical/builder posts to match the new positioning:

- Technical deep-dives on RAG, S3 Vectors, edge-native architecture
- "How we built X" posts about Conversational Search or Content Readiness
- Open source contributions or tooling posts

### Dual-system problem

The Obsidian vault and this repo are separate systems with overlapping content:

- Vault has the strategy docs, career planning, and markdown resume
- This repo has the public-facing site, blog content, and project showcases
- Currently no sync between them

Options to consider:

1. **Manual sync** — update both when things change (current approach, prone to drift)
2. **Symlink or copy script** — keep Resume.md in vault, copy to site at build time
3. **Content as submodule** — probably overkill for this use case
4. **Accept the split** — vault is private strategy, site is public face. They serve different purposes. Just keep a checklist of what to update in both when positioning changes.

Recommendation: Option 4 for now. The vault is the source of truth for strategy; the site is the public output. When you update the narrative, update both, but don't try to automate the sync — the content needs to be adapted for each context anyway (vault is honest/private, site is public/polished).

## Action items

- [ ] Rewrite about page to match new positioning
- [ ] Consider adding /resume route
- [ ] Plan 2-3 technical blog posts that signal builder, not manager
- [ ] Keep vault and site manually synced — vault is strategy source, site is public output
