---
name: portfolio-audit
description: Monthly audit — compare what shipped (local repos, GitHub, vault daily notes) against what the site shows; output a gap report and schedule proposals. Run on the first Friday of each month or on demand ("portfolio audit", "is the site up to date").
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Portfolio Audit

Launch four parallel read-only research subagents, then synthesize a gap report. Make no changes.

1. **Site inventory** — every article/project/page in packages/content/ with dates and draft flags; newest publish dates per collection; staleness scan of hero (apps/web/src/components/Hero.astro), about, contact, site-config.ts (role claims, project lists, hardcoded years, social links).
2. **Local repo sweep** — ~/Work/Git/ repos with commits since the last audit: what shipped, what's portfolio-worthy (case study) or blog-worthy (technique/story), notable unmerged branches.
3. **GitHub check** — gh CLI: recently pushed repos vs pinned repos; profile README freshness (jasonm4130/jasonm4130); repos missing descriptions.
4. **Vault check** — content calendar / Scheduled Posts state (planned vs published vs overdue); daily-note [repo-name] outcome lines since last audit; new drafts or idea seeds.

Synthesize into a report with four sections: **Gaps** (shipped but not on site), **Stale** (site claims that drifted), **Overdue** (scheduled content not shipped), **Proposals** (next 2–3 schedule slots with sources). Save to the scratchpad, send to Jason, and update docs/superpowers/plans/ only if he asks for a new plan. Never publish or edit content from inside the audit.
