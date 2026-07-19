# Design System — Notebook Article Furniture

**Date:** 2026-07-19
**Status:** Shipped (Stage D of the notebook implementation)
**Plan:** `docs/superpowers/plans/2026-07-18-astro-notebook-implementation.md`

The durable half of Stage D: the authoring conventions and token roles behind the
article/project reading templates. The CSS lives in `apps/web/src/styles/global.css`
(the "Article Template" section); the transforms live in `apps/web/src/plugins/`.
This is a reference for writing content, not a spec.

## Article layout (three zones)

`writing/[id].astro` renders `width="wide"` and lays out a three-zone grid:

1. **TOC rail** (`.art-toc`, left) — sticky. Auto-built from the article's `h2`
   headings via `render()`'s `headings`; each is numbered and scroll-spy highlights
   the active section (an `IntersectionObserver`, re-armed on `astro:page-load`). The
   rail also carries the kind · date · reading-time meta block. Hidden below 900px.
2. **Serif column** (`.art-prose`, centre) — the reading body. `h2`s are auto-numbered
   `/01…` via a CSS counter, links get a coral bottom border, blockquotes a coral rule.
3. **Sidenote gutter** (right, 236px) — where `[^n]` footnotes float as margin notes.
   On mobile the gutter collapses and sidenotes inline where referenced.

The gutter is **reserved only when the article actually has footnotes** —
`remark-sidenotes` sets a `hasSidenotes` frontmatter flag and the template adds
`.has-notes` to `.art`. Without it, `.art` narrows (1080 → 844px) and the reading
column centres as a balanced unit instead of leaving an empty right margin; the gutter
returns automatically the moment an article uses `[^n]`.

A pure-CSS reading-progress bar (`.progbar`, `animation-timeline: scroll()`) sits above
the grid; it's removed under `prefers-reduced-motion`.

The **per-kind header** reads `thread · kind` as its kicker, then title, standfirst
(the `excerpt`), and a `date · read · updated` meta line. `kind` comes from the article
frontmatter (`essay` default, plus `buildlog`/`incident`/`architecture`); the primary
thread is the first of `threads` that resolves in the controlled vocabulary.

The **project template** (`projects/[id].astro`) shares the serif voice via
`.art-prose.case-narrow` — the `case-narrow` modifier resets the article's gutter
padding and section numbering, since a case study is a single-column read.

## Code — Expressive Code + self-hosted Krypton

Code blocks are rendered by [Expressive Code](https://expressive-code.com) (registered
before `mdx()` in `astro.config.mjs`), themed to a warm notebook palette in
`apps/web/src/lib/krypton-theme.ts`. The code face is **Monaspace Krypton**, self-hosted
via the Astro Fonts API (no Google Fonts request); inline `code` in prose renders Krypton
too, for code-context consistency.

Two themes named `light`/`dark` map to `:root[data-theme='…']`, with
`useDarkModeMediaQuery` covering system-dark-with-no-explicit-choice — mirroring the
CSS token tri-state. There is a **single coral accent**, no multicolor and no green/red:

| Role                    | Light                                  | Dark                         | Notes          |
| ----------------------- | -------------------------------------- | ---------------------------- | -------------- |
| Keyword                 | coral                                  | coral                        | the one accent |
| String                  | olive                                  | sage                         |                |
| Function                | amber                                  | tan                          |                |
| Type                    | gold                                   | gold                         |                |
| Number                  | rust                                   | rust                         |                |
| Comment                 | faint                                  | faint                        |                |
| Line highlight (`mark`) | coral tint + coral inline-start border | matches prose blockquote     |
| Diff `ins` / `del`      | coral / dimmed faint                   | `+`/`−` gutter, no green/red |

Expressive Code plugins in use: frames (filename/title bar, copy button), text markers
(line highlight), and diff. Use them with the standard EC meta syntax:

````markdown
```ts title="worker.ts" {3-5} ins={7}
// line 3-5 highlighted, line 7 marked as an insertion
```
````

## Callouts — `:::` container directives

Authored with [remark-directive](https://github.com/remarkjs/remark-directive) syntax and
remapped by `remark-callouts.mjs` to one restrained `<aside class="callout">` treatment
(mono label + coral rule, no per-type colours):

```markdown
:::note[Worth knowing]
Body prose. Markdown works inside.
:::
```

- The `[Label]` becomes the callout heading.
- Without a label, the directive **name** is used, capitalised: `:::warn` → "Warn".
- A `label="…"` attribute is honoured as a fallback.

There is one visual style regardless of name — the name is just the default label. Keep
callouts rare; they earn their weight by being uncommon.

## Sidenotes — `[^n]` footnotes

Authored as standard GFM footnotes and converted by `remark-sidenotes.mjs` into
Tufte-style margin notes. The reference becomes a `<sup class="sn-ref">`; the definition
is inlined at its reference site as a `<span class="sidenote">` that floats into the
right gutter (and inlines on mobile). The bottom "Footnotes" section GFM would generate is
removed.

```markdown
Astro renders this at build time.[^1]

[^1]: Which is why the sidenote gutter costs nothing at runtime.
```

- Notes are **renumbered 1..n by order of appearance**, regardless of the source labels
  (`[^longhand]` and `[^1]` both get sequential numbers).
- A reference with no matching definition keeps its marker and adds no empty gutter box.
- A cyclic reference — a footnote that references itself, or a mutual `a → b → a` chain —
  breaks the cycle: the back-reference renders as a bare marker rather than recursing, so a
  malformed footnote never crashes the build.

## Series navigation — dormant

The article footer renders a chapter list + prev/next arrows **only when** an article sets
`series` and `seriesOrder`. No published article uses this yet; the code path is fixture-
tested and stays inert until content opts in. The build gate validates that a series'
`seriesOrder` values form a contiguous `1..n` (see `content-graph.ts`).

## Related cross-links

`related: [{ label, href }]` on an article or project renders as a card in the footer.
An internal `/writing/…` or `/projects/…` href that resolves to a **published** entry
becomes a rich card (title, live dot when the target has a `liveUrl`, description);
external links pass through as plain cards; links to missing or unpublished entries are
omitted at render time and **fail the build** at the content-graph gate. Author related
links freely — the gate keeps them honest.

## Motion

Motion is rationed and shares one vocabulary. Durations and easings live as tokens on
`:root` in `global.css` (theme-independent — motion doesn't change between light/dark):

| Token             | Value                            | Use                                    |
| ----------------- | -------------------------------- | -------------------------------------- |
| `--dur-1`         | 120ms                            | micro (colour shifts)                  |
| `--dur-2`         | 180ms                            | standard (link underline, row hover)   |
| `--dur-3`         | 300ms                            | the longest a UI transition should run |
| `--ease-out`      | `cubic-bezier(0.33, 1, 0.68, 1)` | enters / draws-in (decelerate)         |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)`   | symmetric state changes                |

Four named interactions build on them:

- **Travelling title** — a writing-list row title and the article `<h1>` it links to
  share a `view-transition-name` (`title-<slug>`, from the row's href / `post.id`), so
  Astro's `ClientRouter` morphs the title from list to header on navigation instead of a
  hard cut. Names are unique per page; the two ends are the same typeface (Libre
  Baskerville), so it reads as one title growing, not a font swap.
- **Crafted link underline** (`.art-prose a`) — a persistent faint-coral hairline
  (`background-size: 100% 1px`) plus a coral layer that draws in left-to-right on hover
  (`0% → 100% 1.5px`) over `--dur-2 --ease-out`, text turning coral. Replaces a static
  `border-bottom`.
- **Theme toggle** (`ThemeToggle.astro` + `global.css`) — the header icon morphs
  sun/moon on a flip (rays retract + fade over `--dur-3`, a mask slides across the disc
  to carve the crescent), driven off the token tri-state (explicit `data-theme`, else
  system) so it always matches the palette. The palette change itself cross-dissolves
  through a **scoped** view transition: `theme-toggle.js` flags `<html>` with `.theme-vt`
  for the duration and `:root.theme-vt::view-transition-old/new(root)` runs a plain fade,
  so a theme flip is a calm full-page crossfade rather than the page-nav slide.
- **Ruled mobile menu** (`Nav.astro` + `global.css`) — the toggle is three right-aligned
  marks that go coral and level to 20px on open; each menu row is a ruled line that draws
  left-to-right (`scaleX 0` to `1`, staggered per-row `--d`) with the link settling onto
  it (`opacity` + `translateY`) just after its rule is drawn.

Every motion path has a `@media (prefers-reduced-motion: reduce)` guard: transitions
drop to `none` (colour still changes), hover indents don't translate, the `ClientRouter`
skips the view-transition animation, a theme flip snaps instantly (no crossfade), and the
ruled menu rows appear already drawn.
