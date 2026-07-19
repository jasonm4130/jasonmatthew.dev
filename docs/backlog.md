# Backlog

Small, non-blocking follow-ups after the notebook redesign shipped (PRs #19–22, live
2026-07-19). Nothing here blocks anything; items are grouped by where the work actually
lives. Content planning and scheduling live in the private content-ops workspace, not
here — this list only tracks the durable follow-ups.

## Content — via content-ops (propose → approve, frontmatter-only)

- [ ] **Cross-link the 15 articles with no `related:`.** Only 2 of 17 articles are
      cross-linked today, so most article footers render no related-work cards. Add
      `related: [{ label, href }]` frontmatter. The content-graph gate fails the build on
      a link to a missing / unpublished / draft target, so the links stay honest.
      Regenerate this list any time with:
      `for f in packages/content/articles/*.mdx; do grep -q '^related:' "$f" || basename "$f" .mdx; done`
  - [ ] `ai-memory-is-cosmetic`
  - [ ] `ai-wont-replace-your-seniors`
  - [ ] `claude-code-workflow-model-guard`
  - [ ] `cloudformation-surgical-recovery`
  - [ ] `durable-lambda-deployment-gotcha`
  - [ ] `home-cooked-software`
  - [ ] `s3-vectors-in-production`
  - [ ] `terraform-for-cloudflare`
  - [ ] `the-3-2-1-ai-engineering-manager`
  - [ ] `the-one-on-one-that-actually-changed-something`
  - [ ] `the-side-project-as-a-management-tool`
  - [ ] `what-is-a-senior`
  - [ ] `zero-secrets-in-git`
  - [ ] `how-would-you-know` — draft; cross-link when it ships
  - [ ] `rag-eval-harness` — draft; cross-link when it ships

## Code — this repo

- [ ] **Decide `AnimatedDemo.astro`: retire or keep.** Logged "unresolved" in the
      implementation plan. It is **not** dead — `packages/content/projects/pipespy.mdx`
      uses it — so "retire" means migrating pipespy off it (a plain `<video>` or an
      image), and "keep" means leaving it as-is. Low urgency. (Inline `TODO` marker lives
      at the top of the component.)

## Content-driven — built but dormant (no code work; activates when content arrives)

- [ ] **Series arcs.** The article footer's chapter list + prev/next is built and
      fixture-tested but inert; no article sets `series` / `seriesOrder`. It lights up the
      moment a multi-part arc is authored.
- [ ] **`/notes` (TIL) tier.** Deliberately not built — the route, nav entry, and RSS
      stay off until ≥5 real notes exist (no empty tier, no stale feed). Remaining: write
      the notes (content-ops / vault). Optional feeder: extend the daily-note logging hook
      to capture substantial technical learnings into a notes stream (dotfiles / vault
      tooling; parked "not now").

## Deferred infra niceties (explicitly deferred; low priority)

- [ ] **Visual-regression tests** — Playwright `toHaveScreenshot()` with Docker-pinned
      baselines. The Container-API component tests in `apps/web/test/` are the agreed v1
      bar; this is a later pass.
- [ ] **Token-doc drift-check** — a small `css-tree` extractor + CI check so a tokens doc
      can't drift from `global.css`. Skip Style Dictionary until there is more than one
      output platform to justify it.

## Design reference — Claude Design (not this repo)

- [ ] **Sync the `/design` reference + specimens to the shipped palette.** The Claude
      Design reference and its ~6 specimens may still show the pre-ship coral `#e0512f`;
      the shipped, AA-safe palette is `#b83c1c` (light) / `#ee6547` (dark). Cosmetic, but
      keeps the design system and the built site one source of truth.
