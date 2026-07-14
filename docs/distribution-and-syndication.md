# Distribution & Syndication

**Date:** 2026-07-15
**Status:** Proposed
**Vault companion (the strategy + full evidence):** `Areas/Professional/Career Resilience/Content Distribution Strategy.md`
**Supersedes the "where do I cross-post?" open question in:** `docs/superpowers/plans/2026-07-03-site-refresh-and-content-schedule.md`

## The question, and why the answer is "neither"

The question was: **dev.to or Substack** — which developer platform should the blog build a presence on, to maximise _reach and credibility_ with developers (explicitly not email-list ownership, not monetisation)?

Researched properly, the honest answer is that **the premise is wrong**. In this niche, in 2026, reach is not produced by publishing platforms. It is produced by **distribution events** — an HN front page, a newsletter pickup, an X thread that catches — and by the **artefact** being genuinely useful. Where the words are hosted barely moves the needle.

The evidence that settles it (full citations in the vault note):

- **MCP's own breakout** came from X livetweets of a Latent Space workshop, not from any publishing platform.
- **HN has the only real ceiling** here (Anthropic's MCP launch: 872 pts; "A critical look at MCP": 623 pts) — but a brutal floor (typical indie MCP Show HN: ~13 pts). It is a high-EV lottery, not a schedule.
- **Opinionated beats announcement.** A third-party developer's take on Cloudflare's code-mode pattern outscored _Cloudflare's own post about it_.
- **dev.to's feed structurally suppresses new authors**, and its `#ai`/`#mcp` tags are a firehose where most posts land at 0–1 reactions.
- **Substack is an email-list instrument**, which is explicitly not the goal, and its discovery needs a subscriber base before it does anything.

## The SEO trap that shapes the mechanism

This is the finding that dictates _how_ we syndicate, and it contradicts the usual "just cross-post with a canonical tag" advice. Both quotes verified verbatim from Google Search Central:

> "Indicating a canonical preference is **a hint, not a rule**."

> "The canonical link element is **not recommended** for those who want to avoid duplication by syndication partners... The most effective solution is for partners to block indexing of your content."

Multiple author retrospectives report the predicted outcome: a high-DA dev.to copy outranking the correctly-canonicalised original on a low-DA personal domain — one author quit cross-posting over it.

**So syndication is a trade, not a free win.** The mitigation is _delay_: publish canonically, let Google index the original, and only then mirror.

## Decisions

| #   | Decision                                                      | Rationale                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **jasonmatthew.dev stays the canonical home for everything.** | Already has canonical tags (`BaseHead.astro`), RSS, sitemap, and the daily cron rebuild. Nothing to build.                                                                                                                                                             |
| 2   | **dev.to is the one syndication mirror.**                     | The only platform left that has a _free write API_, _correctly emits an external `rel=canonical`_ (verified in raw HTML), and offers clean export + an open-source escape hatch (Forem).                                                                               |
| 3   | **Mirror only after a 5-day delay**, and only to dev.to.      | Gives Google time to establish the canonical on the original. Enforced in code (`SYNDICATE_DELAY_DAYS`), not left to discipline.                                                                                                                                       |
| 4   | **Reject Hashnode.**                                          | It **retired free GraphQL API access on 2026-05-13** — reads _and_ writes now require paid Pro. Automated syndication is now a paid feature.                                                                                                                           |
| 5   | **Reject Medium.**                                            | Write API **closed to new integration tokens**. No automation possible. Export also drops all images.                                                                                                                                                                  |
| 6   | **Reject Substack.**                                          | Wrong instrument (email list), and it appears to have **no canonical support at all** — pure cannibalisation risk with no defence. _(This last point is unverified — sources were unreachable. It is not load-bearing: decision 6 stands on the goal mismatch alone.)_ |
| 7   | **Distribution is a per-post decision, not a broadcast.**     | HN for opinionated/deep pieces and Show HN for runnable things; Latent Space/AINews for the topically-aligned newsletter hit; r/mcp + r/ClaudeAI + r/LocalLLaMA for discussion; X for threads. LinkedIn continues per the existing SOP.                                |

## The highest-leverage move is not a blog post

The evidence says a **usable tool plus an opinionated writeup** is the shape that travels in this niche. `social-mcp` — a self-hosted MCP server that schedules and publishes LinkedIn/X posts on Cloudflare — is exactly that shape, and it is already built.

**Open-sourcing `social-mcp` and taking it to Show HN is the single highest-EV reach play available**, and the blog post becomes its supporting document rather than the main event. That sequencing (artefact first, post second) is the opposite of the current content calendar's default, and it's deliberate.

## Implementation

`scripts/syndicate-devto.mjs` — mirrors published articles to dev.to with `canonical_url` pointing home.

- **Dry run by default.** `--publish` to actually mirror.
- **Delay gate:** skips anything published within `SYNDICATE_DELAY_DAYS` (default 5).
- **Idempotency by interrogation, not state:** it asks dev.to what it already has and matches on `canonical_url`. It does _not_ keep a state file in the repo — a stale state file is the documented way these pipelines end up spamming the API.
- **Refuses to mangle MDX:** any article containing JSX components is skipped with a warning rather than mirrored broken.

```bash
export DEVTO_API_KEY=...        # dev.to → Settings → Extensions → DEV Community API Keys
node scripts/syndicate-devto.mjs            # see what it would do
node scripts/syndicate-devto.mjs --publish  # mirror
```

`.github/workflows/syndicate-devto.yml` runs it on **manual dispatch only**. Deliberately not on a schedule: given that the mirror can outrank the original, mirroring should stay a decision, not a default. Flip it to a cron once there's evidence the canonical is holding.

## What to verify before trusting this

- **Check Search Console** that the original is indexed before mirroring (the delay is a proxy for this, not a substitute).
- **After the first few mirrors,** check whether the dev.to copy is outranking the original for its own title. If it is, stop mirroring — the trade has gone bad, and the evidence says that is a live possibility rather than a paranoid one.

## Unverified claims (do not treat as fact)

Flagged because the research run's own citation-integrity gate rejected its first output (workers cited sources they had not fetched); every load-bearing claim above was then re-fetched and re-verified. These did not survive re-verification and are retained only as weak priors:

- Substack's lack of canonical support (help centre Cloudflare-blocked; Google forum thread JS-gated).
- dev.to's new-author feed suppression (single-source).
- The outranking retrospectives and HN/newsletter reach figures (directionally consistent across independent sources, not primary-verified).
