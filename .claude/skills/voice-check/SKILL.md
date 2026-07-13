---
name: voice-check
description: Use when writing, reviewing, or editing ANY public-facing text before it ships — blog articles, project case studies, LinkedIn/X post copy, README or bio text, meta descriptions — or when asked to "voice check", "de-AI", or review a draft for tone. Also use BEFORE claiming any draft is ready for publishing.
---

# Voice Check

Two tiers. Tier 1 is mechanical and non-negotiable; Tier 2 is judgment. A review that skips Tier 1 will miss em-dashes and recommend banned constructions as "fixes" (measured baseline failure).

## Tier 1 — run the lint, fix every BLOCK

```bash
node scripts/voice-lint.mjs <files>                      # blog/article/README prose
node scripts/voice-lint.mjs --social --platform x <file> # X copy (adds emoji/hashtag/280-weighted checks)
node scripts/voice-lint.mjs --social <file>              # LinkedIn copy
```

Fix BLOCK findings by rewriting, never by exempting:

- **em-dash** → period, comma, colon, or parentheses (house rule is zero in signed prose; commit `f3077e7` cut 180→6). Never suggest an em-dash as a fix for anything.
- **banned-word / marketing-ai / influencer-fluff** → delete or replace with a plain, specific word.
- Read every WARN and act or consciously keep (say which).

## Tier 2 — judgment checklist

Compare against two published anchors: `packages/content/articles/ai-memory-is-cosmetic.mdx`, `packages/content/projects/goblins-game-parlour.mdx`.

1. **Negative parallelism** ("it's not X, it's Y" and kin): at most one deliberate instance per piece. LinkedIn algorithmically penalises the construction.
2. **Every number and anecdote traces to a source** (repo, ADR, eval output, daily note). No invented timelines, no false precision — round honestly ("about a second", not "1.1s" from n=3).
3. **No invented alliterative frameworks** ("The Pattern/Impact/Edge"); cite real named ones (SBI, RRF) in plain language.
4. **A position is taken.** Both-sides framing is an RLHF artefact. Honest uncertainty is ADDED where real ("I don't know", "I might just be screaming into the void") — never cut it.
5. **First person owns failures**: "until I ran it again", not "until someone ran it".
6. **Rule-of-three padding**: triplets where the third item is filler get cut to the real two.
7. **LinkedIn specifics**: → arrows for enumerations (house tic, keep), no bullets-as-emoji, no hashtags, no emoji, link inline at the natural CTA point, no engagement-bait closer, ends on a statement or link.
8. **X specifics**: single tweet (no threads), ≤280 weighted.
9. **Blog specifics**: figures not word-numbers, Australian spelling, short sentences with varied length (deliberate fragments are house style — keep them), section headings are flat claims not gimmicks ("The 10-second nap that ate my pageviews" ✓, "The Uncomfortable Truth" ✗).

## Output contract

Findings table: severity | location | quoted text | proposed fix. Then one verdict: **SHIP** / **FIX THEN SHIP** (list blocking items) / **REWRITE**. Quote the lint output line count in the verdict. "Looks good" without lint output is not a verdict.
