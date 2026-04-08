# Portfolio Polish & Animations — Design Spec

**Date:** 2026-04-08
**Goal:** Add creative flair and final polish to jasonmatthew.dev — one standout moment with a refined, subtle baseline. Nothing polarizing.

## Principles

- **CSS-first, zero dependencies.** All animations use CSS `@keyframes`, transitions, and `animation-timeline: view()`. No JS animation libraries.
- **Graceful degradation.** Firefox (which doesn't support `animation-timeline: view()`) sees content immediately with no animation. No broken states.
- **Accessibility.** All motion is disabled under `prefers-reduced-motion: reduce`. Elements default to their visible, final state.
- **Non-polarizing.** Subtle by default. Craft over gimmick.

## 1. Signature Draw-On (Standout Moment)

**Location:** Footer (`Footer.astro`), where the `Signature.astro` SVG already renders.

**Behaviour:**

- The Signature SVG's two `<path>` elements receive `stroke-dasharray` and `stroke-dashoffset` set to their total path lengths.
- A `@keyframes draw` animation reduces `stroke-dashoffset` to 0 over ~2 seconds, creating a stroke-by-stroke drawing effect.
- The animation is triggered via `animation-timeline: view()` — plays as the footer scrolls into the viewport.
- `fill` starts transparent (`fill-opacity: 0`). After the stroke completes, a delayed `fill-opacity` animation fades fill to 1 — so you see the outline draw first, then it solidifies.
- The `© 2026` text next to the signature fades in with a slight delay after the draw completes.

**Reduced motion:** Signature and text appear immediately, no animation.

**Firefox fallback:** Signature renders as it does today — static, fully visible.

**Files affected:**

- `apps/web/src/icons/Signature.astro` — add stroke animation CSS, initial state styles
- `apps/web/src/components/Footer.astro` — add reveal class to copyright text
- `apps/web/src/styles/global.css` — add `@keyframes draw` and related animation styles

## 2. Scroll Reveals (Soft Appearance Layer)

**What gets the treatment:**

- Section headings ("Featured Projects", "Writing")
- Post preview items (`PostPreview.astro`)
- Project cards (`ProjectPreview.astro`)
- Content sections on inner pages (about, blog post body, project detail)

**Behaviour:**

- A single CSS utility class `.reveal` applied to animated elements.
- Default state: `opacity: 0; translate: 0 8px`.
- Viewport entry: animates to `opacity: 1; translate: 0 0` over ~200ms ease-out.
- Uses `animation-timeline: view()` with `animation-range: entry 0% entry 20%` — triggers early so elements appear before the user reaches them.

**What does NOT get the reveal:**

- Nav (sticky, always visible)
- Hero section (has its own page-load animation)
- Footer signature (has its own draw animation)

**Reduced motion:** Elements have full opacity and no translate by default.

**Firefox fallback:** Elements are fully visible, no animation. Achieved via `@supports` wrapping the `animation-timeline` rules.

**Files affected:**

- `apps/web/src/styles/global.css` — add `.reveal` class with `@supports (animation-timeline: view())` block
- `apps/web/src/pages/index.astro` — add `.reveal` to section headings, card containers
- `apps/web/src/components/PostPreview.astro` — add `.reveal` to article element
- `apps/web/src/components/ProjectPreview.astro` — add `.reveal` to article element
- `apps/web/src/pages/blog/[id].astro` — add `.reveal` to article content wrapper
- `apps/web/src/pages/projects/[id].astro` — add `.reveal` to project content wrapper
- `apps/web/src/pages/[...id].astro` — add `.reveal` to generic page content wrapper

## 3. Hero Entrance (Homepage Page Load)

**Location:** `Hero.astro`, homepage only.

**Behaviour:**

- Headline text starts `opacity: 0; translate: 0 12px`.
- On page load, animates to `opacity: 1; translate: 0 0` via CSS `@keyframes` with `animation-fill-mode: both`.
- Staggered timing:
  - Main title line: ~0.5s ease-out, no delay
  - Coral accent phrase ("better than I found them"): ~0.5s ease-out, 0.2s delay
  - Subtitle paragraph: ~0.5s ease-out, 0.6s delay

**Reduced motion:** All elements visible immediately, no animation.

**Files affected:**

- `apps/web/src/components/Hero.astro` — add animation classes to title, accent span, subtitle
- `apps/web/src/styles/global.css` — add `@keyframes fadeUp` for the hero entrance

## 4. Enhanced Micro-Interactions

### 4a. Buttons (`Button.astro`)

- **Current:** Background fills with accent on hover.
- **Add:** `scale(0.98)` on `:active` with ~100ms transition. Subtle press feel.

### 4b. Project Cards (`ProjectPreview.astro`)

- **Current:** Border changes to accent on hover, arrow translates right.
- **Add:** `translate: 0 -2px` on hover with a soft `box-shadow` — cards lift slightly off the surface. Keep existing border effect.

### 4c. Post Previews (`PostPreview.astro`)

- **Current:** Title changes to accent on hover.
- **Add:** A small `→` arrow that slides in on hover after the title, matching the project card interaction pattern.

### 4d. Nav Links

- **Current:** Color transition on hover.
- **Add:** Animated underline using `background-image: linear-gradient(...)` with `background-size` animating from `0% 2px` to `100% 2px` on hover. Draws in from left.

**Reduced motion:** All hover effects reduce to instant color changes only, no movement or scale.

**Files affected:**

- `apps/web/src/components/Button.astro` — add `:active` scale
- `apps/web/src/components/ProjectPreview.astro` — add hover translate and shadow
- `apps/web/src/components/PostPreview.astro` — add arrow element and hover slide-in
- `apps/web/src/components/NavLink.astro` — replace default underline with animated background underline

## 5. Enhanced Page Transitions

**What exists:** Astro `ClientRouter` provides default crossfade view transitions.

**What we add:**

- Custom `::view-transition-old(root)` and `::view-transition-new(root)` animations — outgoing page slides down slightly and fades out, incoming page fades up. ~250ms duration.
- Nav marked with `transition:persist` so it stays anchored during transitions and doesn't participate in the page animation.

**What we don't do:**

- No per-element morph transitions (e.g. blog title morphing from list to post). These add complexity and can feel janky with layout shifts.

**Reduced motion:** Instant transition, no animation.

**Files affected:**

- `apps/web/src/styles/global.css` — add `::view-transition-old(root)` and `::view-transition-new(root)` keyframes
- `apps/web/src/components/Nav.astro` — add `transition:persist` to nav element
- `apps/web/src/layouts/BaseLayout.astro` — potentially adjust view transition config

## Technical Notes

### Browser Support

- `animation-timeline: view()`: Chrome 115+, Edge 115+, Safari 26+, Opera 101+. Firefox has it behind a flag (not enabled by default).
- All scroll-triggered animations wrapped in `@supports (animation-timeline: view())` — unsupported browsers see static content.
- Standard CSS animations/transitions: universal support.

### Performance

- All animations use compositor-friendly properties (`opacity`, `translate`, `scale`). No `width`, `height`, `top`, `left` animations.
- `will-change` not used proactively — only add if jank is observed during testing.

### File Change Summary

- `apps/web/src/styles/global.css` — primary location for all new keyframes and animation utilities
- `apps/web/src/components/Hero.astro` — hero entrance animation classes
- `apps/web/src/components/Footer.astro` — signature reveal delay
- `apps/web/src/icons/Signature.astro` — stroke draw animation
- `apps/web/src/components/Button.astro` — active press
- `apps/web/src/components/ProjectPreview.astro` — card lift + reveal
- `apps/web/src/components/PostPreview.astro` — arrow + reveal
- `apps/web/src/components/NavLink.astro` — animated underline
- `apps/web/src/components/Nav.astro` — transition:persist
- `apps/web/src/pages/index.astro` — reveal classes on sections
- `apps/web/src/layouts/BaseLayout.astro` — view transition tweaks
- `apps/web/src/pages/blog/[id].astro` — reveal class on article content
- `apps/web/src/pages/projects/[id].astro` — reveal class on project content
- `apps/web/src/pages/[...id].astro` — reveal class on generic page content
