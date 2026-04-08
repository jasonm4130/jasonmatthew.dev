# Portfolio Polish & Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CSS animations and polish to jasonmatthew.dev — signature draw-on as the standout moment, subtle scroll reveals, hero entrance, enhanced micro-interactions, and custom page transitions.

**Architecture:** All animations are pure CSS — `@keyframes`, transitions, and `animation-timeline: view()` for scroll-triggered effects. Scroll-triggered features wrapped in `@supports` for Firefox graceful degradation. All motion respects `prefers-reduced-motion: reduce`.

**Tech Stack:** CSS animations, CSS `animation-timeline: view()`, Astro view transitions, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-04-08-polish-and-animations-design.md`

---

## File Map

| File                                           | Action | Purpose                                                                             |
| ---------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| `apps/web/src/styles/global.css`               | Modify | All new keyframes, `.reveal` utility, view transition CSS, reduced motion overrides |
| `apps/web/src/icons/Signature.astro`           | Modify | Add `pathLength="1"` to paths, stroke animation styles                              |
| `apps/web/src/components/Footer.astro`         | Modify | Add reveal class to copyright text                                                  |
| `apps/web/src/components/Hero.astro`           | Modify | Add staggered entrance animation classes                                            |
| `apps/web/src/components/Button.astro`         | Modify | Add `:active` scale press effect                                                    |
| `apps/web/src/components/ProjectPreview.astro` | Modify | Add card lift hover, `.reveal` class                                                |
| `apps/web/src/components/PostPreview.astro`    | Modify | Add arrow slide-in, `.reveal` class                                                 |
| `apps/web/src/components/NavLink.astro`        | Modify | Animated underline via background-image                                             |
| `apps/web/src/components/Nav.astro`            | Modify | Add `transition:persist`                                                            |
| `apps/web/src/pages/index.astro`               | Modify | Add `.reveal` to section headings                                                   |
| `apps/web/src/pages/blog/[id].astro`           | Modify | Add `.reveal` to content wrapper                                                    |
| `apps/web/src/pages/projects/[id].astro`       | Modify | Add `.reveal` to content wrapper                                                    |
| `apps/web/src/pages/[...id].astro`             | Modify | Add `.reveal` to content wrapper                                                    |

---

### Task 1: Add animation keyframes and utilities to global.css

**Files:**

- Modify: `apps/web/src/styles/global.css:147-152` (append after `::selection` block)

This task adds ALL keyframes, the `.reveal` scroll utility, view transition CSS, and reduced motion overrides in one place. Every subsequent task just applies classes — no more CSS changes needed.

- [ ] **Step 1: Add the animation keyframes and utilities**

Add the following after the `::selection` block (after line 152) in `apps/web/src/styles/global.css`:

```css
/* ─── Animation Keyframes ──────────────────────────────────── */

@keyframes fadeUp {
  from {
    opacity: 0;
    translate: 0 12px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fillIn {
  from {
    fill-opacity: 0;
  }
  to {
    fill-opacity: 1;
  }
}

@keyframes revealFade {
  from {
    opacity: 0;
    translate: 0 8px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

/* ─── Scroll Reveal Utility ────────────────────────────────── */

@supports (animation-timeline: view()) {
  .reveal {
    animation: revealFade 1s ease-out both;
    animation-timeline: view();
    animation-range: entry 0% entry 20%;
  }
}

/* ─── Signature Draw Animation ─────────────────────────────── */

@supports (animation-timeline: view()) {
  .signature-draw path {
    fill-opacity: 0;
    stroke: currentColor;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation:
      draw 2s ease-in-out both,
      fillIn 0.5s ease-out both;
    animation-timeline: view(), view();
    animation-range:
      entry 0% entry 30%,
      entry 30% entry 40%;
  }

  .signature-draw-delay {
    opacity: 0;
    animation: fadeUp 0.5s ease-out both;
    animation-timeline: view();
    animation-range: entry 30% entry 45%;
  }
}

/* ─── Hero Entrance ────────────────────────────────────────── */

.hero-title {
  animation: fadeUp 0.5s ease-out both;
}

.hero-accent {
  animation: fadeUp 0.5s ease-out 0.2s both;
}

.hero-subtitle {
  animation: fadeUp 0.5s ease-out 0.6s both;
}

/* ─── View Transitions ─────────────────────────────────────── */

@keyframes slideOutDown {
  from {
    opacity: 1;
    translate: 0 0;
  }
  to {
    opacity: 0;
    translate: 0 8px;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    translate: 0 8px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

::view-transition-old(root) {
  animation: slideOutDown 0.25s ease-in both;
}

::view-transition-new(root) {
  animation: slideInUp 0.25s ease-out both;
}

/* ─── Nav Link Animated Underline ──────────────────────────── */

.nav-link-underline {
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0% 100%;
  background-repeat: no-repeat;
  background-size: 0% 2px;
  transition:
    background-size 0.3s ease-out,
    color 0.2s ease;
}

.nav-link-underline:hover {
  background-size: 100% 2px;
}

/* ─── Reduced Motion ───────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .hero-title,
  .hero-accent,
  .hero-subtitle {
    animation: none;
  }

  .reveal {
    animation: none !important;
  }

  .signature-draw path {
    animation: none !important;
    fill-opacity: 1;
    stroke-dashoffset: 0;
  }

  .signature-draw-delay {
    animation: none !important;
    opacity: 1;
  }

  .nav-link-underline {
    transition: color 0.2s ease;
    background-size: 0% 2px;
  }

  .nav-link-underline:hover {
    background-size: 100% 2px;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

- [ ] **Step 2: Verify the dev server starts without errors**

Run: `pnpm dev`

Expected: Dev server starts successfully with no CSS compilation errors. The site should look identical to before — no animations are applied yet because no classes have been added to components.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/styles/global.css
git commit -m "feat: add animation keyframes, scroll reveal utility, and reduced motion overrides"
```

---

### Task 2: Signature draw-on animation

**Files:**

- Modify: `apps/web/src/icons/Signature.astro`
- Modify: `apps/web/src/components/Footer.astro`

- [ ] **Step 1: Add `pathLength="1"` and update Signature.astro**

The SVG currently uses `fill="currentColor"` and no stroke. Add `pathLength="1"` to both `<path>` elements so the stroke dash animation can use normalised values (0 to 1). The CSS class applied by the parent will handle the animation.

Replace the full content of `apps/web/src/icons/Signature.astro` with:

```astro
---
interface Props {
  class?: string;
}

const { class: className } = Astro.props;
---

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2690 757" fill="currentColor" class={className} aria-hidden="true">
  <g transform="matrix(5.29286 0 0 -5.29286 -4244.44 3951.4)">
    <path
      pathLength="1"
      d="M1301.58 639.84c-3.88-1.2-8.64-2.3-14.14-3.26a126.2 126.2 0 0 0-21.64-1.9c-4.15 0-8.2.23-12.03.7-5.27.63-9.65 1.93-13.02 3.86a26.56 26.56 0 0 0-6.82 5.97 36.64 36.64 0 0 0-4.37 6.97l-.76 1.6 1.76-.18a712.87 712.87 0 0 0 37.02-4.69c1.4-.26 3.53-.61 6.5-1.09 2.84-.44 6.01-1 9.43-1.67 3.4-.66 6.71-1.36 9.87-2.07 3.2-.73 5.98-1.52 8.24-2.35l2.79-1.02zm-79.68 19.22a933.25 933.25 0 0 1-84.41 3.74h-2.4l-.54-.01c2.8 4.78 7.72 13.37 16.24 28.55l4.52.05c-4.55-9.02-7.37-15.01-8.44-17.97v-.35c.18-.7 1.11-1.04 2.81-1.04h.92c2.22 0 5.5 2.85 9.86 8.56h.52c-1.57-2.69-2.35-4.6-2.35-5.73v-1.44c.43-.7.9-1.04 1.37-1.04h4.18c1.37.5 3.11 1.48 5.2 2.9a3.8 3.8 0 0 1-.23-1.26c0-1.4 1.1-2.1 3.33-2.1h2.74c4.15 0 8.9 1.87 14.26 5.58.17.02.34.08.52.17a13.38 13.38 0 0 1 1.55 1.05l.72.53c-.5-.88-.91-1.74-1.25-2.58-.33-.85-.5-1.6-.52-2.28-.02-.66.18-1.22.59-1.66.4-.43 1.1-.7 2.1-.78a4.1 4.1 0 0 1 2.51.61c.86.5 1.7 1.14 2.52 1.92.81.79 1.6 1.63 2.36 2.54.76.9 1.45 1.7 2.1 2.4-.35-.76-.7-1.58-1.03-2.47a7.9 7.9 0 0 1-.55-2.47c-.03-.76.16-1.4.57-1.92.4-.52 1.18-.8 2.32-.83 1.4 0 2.73.43 4 1.29 1.26.86 2.45 1.91 3.56 3.17.4-.88.95-1.49 1.62-1.84.67-.35 1.4-.52 2.2-.52.8 0 1.64.15 2.52.45.87.31 1.73.69 2.57 1.14.59.31 1.13.65 1.68.98-.04-2.36-.06-4.75-.05-7.13 0-3.1.3-6.14.88-9.02l.27-1.3zm-101.22 11.53h-.46c1.88 5.34 5.01 11.66 9.41 18.96 0 .96 2.83 1.44 8.5 1.44h6.59v-.4a158.48 158.48 0 0 0-24.04-20m-47.15-10.24c-9.23-.7-18.43-1.54-27.58-2.54a701.62 701.62 0 0 1-48.63-7.1c5.8 7.83 15.16 22.66 28.12 44.53 6.48 10.71 11.54 17.66 15.2 20.85 0-.27.16-.65.48-1.15 0-1.19-.16-2.98-.48-5.37-4.86-22.3-7.3-34.59-7.3-36.88 0-1.49 1.15-2.34 3.44-2.53h.42c1.65 0 3.98 1.57 7 4.72l35.52 40.81c13.83 15.3 24.27 24.25 31.3 26.87.73 0 1.31-1.06 1.76-3.18a42.3 42.3 0 0 0-3.92-12.2c-2.78-6.36-7.26-15.44-13.45-27.22a543.78 543.78 0 0 1-21.88-39.6m23.12 17.04h-.4v.35a10.77 10.77 0 0 0 5.62 5.38h.98l.85-.35c0-.57-2.35-2.36-7.05-5.38m85.23 5.98l-1.95-1.45h-.4c.13.5.92.98 2.35 1.45m128.04-41.5c-1.24 1.44-3.3 2.78-6.15 4a64.36 64.36 0 0 1-10.32 3.28c-3.95.93-7.8 1.7-11.46 2.3a410.8 410.8 0 0 1-13.67 1.98c-13.02 1.94-26.41 3.66-39.9 5.14l-.72.08-.14.72c-.6 3-.92 6.17-.93 9.4 0 3.22.03 6.46.1 9.65.06.82-.07 1.37-.4 1.73-.32.34-.86.54-1.6.63-.16.07-.32.12-.5.14-.34.04-.63-.03-.9-.2a1.35 1.35 0 0 1-.73-.5c-1.5-1.08-2.8-1.9-3.86-2.4a8.7 8.7 0 0 0-2.87-.94c-.72-.06-1.26.1-1.59.48-.34.38-.53.86-.6 1.44.68.85 1.28 1.67 1.8 2.47.52.8 1.02 1.54 1.49 2.21.2.26.4.55.57.87.17.32.26.64.28.94.01.31-.07.59-.26.83-.2.25-.57.42-1.12.5-.76.12-1.45 0-2.07-.34a5.27 5.27 0 0 1-1.66-1.49 8.56 8.56 0 0 1-1.19-2.23c-.3-.84-.5-1.7-.59-2.58-.55-.7-1.18-1.38-1.9-2.05a26.7 26.7 0 0 0-2.1-1.8c-.68-.52-1.3-.92-1.83-1.2-.54-.27-.91-.35-1.11-.24-.1.03-.06.21.1.55.16.33.37.75.64 1.25l.85 1.68c.3.62.56 1.24.77 1.86.2.6.32 1.2.37 1.74.04.56-.05 1.01-.29 1.36-.46.7-1.05.97-1.75.8a6.34 6.34 0 0 1-2.29-1.17c-.83-.63-1.68-1.4-2.56-2.34l-2.51-2.67c-.8-.84-1.55-1.56-2.23-2.14-.69-.58-1.23-.84-1.64-.79-.15.03-.17.2-.07.5.1.31.28.7.53 1.19.24.48.53 1 .85 1.57.32.57.62 1.12.9 1.66.27.54.5 1.04.67 1.49.18.45.25.8.22 1.07-.08.58-.3.97-.65 1.16-.35.18-.78.24-1.3.15a6.14 6.14 0 0 1-1.67-.6 24.94 24.94 0 0 1-3.4-2.1c-.51-.35-.92-.64-1.24-.84a1.59 1.59 0 0 1-.48-.52c-5.81-3.7-10.48-5.66-13.96-5.84h-.46c0 .76.79 2.44 2.35 5.02 6.93 1.53 10.39 2.94 10.39 4.23 0 1.5-1.29 2.34-3.86 2.54h-.84l-3.34-.74c-1.59-1.31-2.91-2.35-3.98-3.14h-.92c-4.87-3.58-8.33-5.84-10.38-6.77a50.11 50.11 0 0 0 3.33 7.52c-.26 1.19-.74 1.79-1.44 1.79h-1.37c-3.48 0-7.12-2.39-10.9-7.17.34.86.52 1.35.52 1.44 2.51 4.77 4.78 9.1 6.81 13 10.38.1 19.54.18 27.42.23v1.85h-.14c-6.57 0-15.35-.08-26.32-.25 7.74 14.82 11.75 22.79 12.02 23.9v.69c-.22.5-1 .96-2.35 1.4a6.1 6.1 0 0 1-2.36-.65l.46-1.8c-4.91-9.3-9-17.16-12.27-23.62l-4-.06h-.45l6.07 11.8v.74c-.35 0-.8.13-1.37.4-.74 0-1.37-.14-1.9-.4-.82-.6-3.04-4.05-6.66-10.35 0-1.7-1.85-2.54-5.55-2.54h-10.9c0 .6 2.06 3.95 6.2 10.05v1.44c-.35 0-.85.12-1.5.35h-.85c-1.4 0-4.25-4.08-8.56-12.24h-9.4c-1.57 0-2.49-.35-2.75-1.05V691l.4-.7c4.79.2 8.1.3 9.92.3h.46c-2.18-4.1-3.98-7.59-5.4-10.5-4.68-2.5-8.54-4.38-11.58-5.63h-.4c0 2.06 1.88 6.37 5.62 12.94v.35c0 .4-.3.65-.91.75h-1.44c-.48 0-1.9-1.1-4.24-3.29-.83 0-1.94.14-3.33.4-1.44 0-3.01-.35-4.7-1.04-4.71-2.26-7.06-4.78-7.06-7.57v-1.04c.26-.73 1.22-1.1 2.87-1.1h.98c2.88 0 5.68 1.44 8.43 4.33h.45v-.4c-.65-.93-.98-2.24-.98-3.93v-.4c0-1.39.96-2.09 2.88-2.09h1.44c2.45 0 5.8 1.19 10 3.5-1.35-3.05-2.04-5.07-2.04-6.03.22-1.2.68-1.8 1.38-1.8h3.33c2.74 0 9.47 4.67 20.18 13.99l-11.16-19.29a839.03 839.03 0 0 1-51.45-2.04c3.65 7.3 7.91 15.22 12.8 23.78 17.06 29.53 25.58 47.94 25.58 55.24v1.05c0 2.09-1.44 3.28-4.34 3.58h-.42c-6 0-13.65-4.78-22.98-14.33-3.74-3.59-9.53-9.67-17.37-18.27-16.73-19.87-28.01-32.54-33.84-38.02 0 .6.12 1.58.36 2.94 4.35 19.5 6.82 31.92 7.42 37.22 0 3.36-1.3 5.03-3.92 5.03h-.9c-1.09 0-2.68-.73-4.77-2.19-7.24-8.96-20.55-29.6-39.93-61.96h-.42a502.63 502.63 0 0 0 24.3 55.54l-.41 1.44h-2.66c-2.81-.9-4.82-2.32-6.03-4.27.64-.5 1.67-.75 3.08-.75-15.68-31.85-23.53-50.83-23.53-56.93v-.39a671.8 671.8 0 0 1-31.15-6.75c-28.13-6.8-54.9-15.72-79.58-26.48l-.1-.04c-.53-.17-.86-.5-1.07-1.08a2.16 2.16 0 0 1 .13-1.8l.06-.14c.16-.53.5-.86 1.08-1.07a2.13 2.13 0 0 1 1.79.13c24.68 10.85 51.48 19.72 79.7 26.4a726.65 726.65 0 0 0 86.82 14.95c7.76.86 15.55 1.6 23.37 2.23-8.87-18.8-13.31-33.22-13.31-43.24 0-4.77 1.44-7.16 4.34-7.16 2.25 0 3.7.6 4.34 1.79v1.04c-.64 0-1.2.14-1.69.4l-2.17-.74-.48 3.58v1.79c0 9.68 4.55 23.98 13.65 42.9a811.46 811.46 0 0 0 51.17 2.25l-.25-.43c0-.76.33-1.15.98-1.15h2.35c.1 0 .44.18.99.51-.17-.23-.27-.43.02.02l.36.22c0 .2-.14.08-.28-.1l.6.96c1.65.01 3.31.04 4.97.04 29.65 0 58.8-1.38 86.63-4.08l.67-.07.2-.64a34.4 34.4 0 0 1 6.66-12.46c3-3.58 7.48-6.49 13.3-8.65 3.21-1.18 8.14-1.85 14.65-2.02 6.58-.16 13.44.07 20.42.68 6.94.6 13.41 1.56 19.23 2.82 7.02 1.53 9.67 3.09 10.66 4.13 1.77 1.84 1.3 2.92.59 3.74M924.12 731.62h-2.35l-.98-.3c-13.32-26.87-25.08-47.68-35.27-62.4-4.44-7.47-12.4-16.43-23.9-26.88-18.99-13.83-34.2-20.75-45.66-20.75h-.46c-4.83 0-7.64 1.68-8.42 5.03 0 3.71 1.85 7.76 5.55 12.14 5.31 7.96 14.72 15.86 28.21 23.69 17.6 8.49 33.77 13.27 48.54 14.33h.45v1.8h-1.44c-4.79 0-12.3-1.2-22.53-3.6-14.98-3.74-29.41-10.54-43.3-20.4-12.9-11.34-19.62-20.41-20.19-27.22 0-.5.15-.74.46-.74 0-4.55 3.6-6.82 10.78-6.82h4.7c2.05 0 5.03.48 8.95 1.44 9.97 2.1 21.88 8.18 35.72 18.27 18.51 12.54 39.22 43.13 62.12 91.76 0 .4-.32.62-.98.65M827.71 734.9h3.73c9.75.7 21.05 1.05 33.9 1.05h14.1c1.57 0 3.92.13 7.06.4 0-.27.17-.4.52-.4 3.18.26 5.68.4 7.51.4h12.15c8.84 0 20.93-.14 36.25-.4 1.7.26 2.94.4 3.73.4 3.91-.2 12.4-.45 25.47-.75.6.23 1.06.35 1.37.35v1.44c-2.22.5-4.11.75-5.68.75h-7.45l-2.8-.4-.99.4c-20.86.23-37.49.35-49.9.35h-30.05c-12.54-.1-18.8-.35-18.8-.75-20.73 0-31.1-.6-31.1-1.8v-.34c0-.46.33-.7.98-.7"
    ></path>
    <path
      pathLength="1"
      d="M954.95 673.64h-.52v1.4h.52zm-.52-1.79h-.46v1.4h.46zm-4.7-5.37h-.46v1.04l.46 3.59c1.39-1.66 2.17-2.5 2.35-2.5-.4-.99-1.18-1.7-2.35-2.13m-19.8 9.9c0 1.46 1.12 2.54 3.34 3.23h.39c-.52-1.26-1.76-2.33-3.72-3.23m-26.26-4.98h-.4v.35a10.77 10.77 0 0 0 5.62 5.38h.98l.85-.35c0-.57-2.35-2.36-7.05-5.38m66.17 3.19l.52.74v.7c0 .43-.33.68-.98.75h-1.37a24.11 24.11 0 0 1-4.03-3.98 24.53 24.53 0 0 0-6.69-3.14 81.06 81.06 0 0 1 1.38 5.03c-.53 2.39-1.62 3.58-3.27 3.58l-2.8-.4c-1.73-1-3.13-2.09-4.22-3.28h-.17c-7.18-4.28-11.88-6.42-14.1-6.42-.83 2.89-1.77 4.78-2.81 5.67 4.09 2.6 6.14 4.28 6.14 5.08 0 1.66-1.11 2.49-3.33 2.49h-1.83c-3.1 0-5.12-1.55-6.08-4.63v-1.15l.96-1.46a134.33 134.33 0 0 0-11.73-5.7h-.4c0 2.05 1.88 6.37 5.62 12.93v.35c0 .4-.3.65-.91.75h-1.44c-.48 0-1.9-1.1-4.25-3.28-.82 0-1.93.13-3.33.4-1.43 0-3-.36-4.7-1.05-4.7-2.26-7.05-4.78-7.05-7.57v-1.04c.26-.73 1.21-1.1 2.87-1.1h.98c2.87 0 5.68 1.45 8.42 4.33h.46v-.4c-.65-.92-.98-2.23-.98-3.93v-.4c0-1.39.96-2.08 2.88-2.08h1.43c3.1 0 7.6 1.85 13.5 5.54 1.23-2.13 1.85-3.64 1.85-4.5-2.4-.93-4.11-1.99-5.16-3.19v-1.44h2.81c2.83 0 4.7.95 5.62 2.84 4.27.96 8.36 2.53 12.28 4.68-.25-.89-.4-1.82-.4-2.79v-.4c0-1.22.62-2.04 1.83-2.44h4.25c2.53 1.23 3.79 2.3 3.79 3.19 2.3 0 4.53.42 6.69 1.22-.1-.43-.16-.85-.16-1.27v-.4c0-.5.28-.74.85-.74h3.33c.74 0 4.96 3.71 12.67 11.14h.46c-3.7-6.33-5.55-10.05-5.55-11.14v-1.8l2.35-.3h1.83c3.22 0 8.23 3.09 15.02 9.26v.4c0 .43-.3.68-.91.75h-2.36c-7.05-5.28-10.97-7.92-11.75-7.92 3.74 6.57 5.61 10.4 5.61 11.5v1.4c-.48.69-.93 1.04-1.37 1.04h-1.9c-2.34 0-5.63-2.14-9.85-6.42h-.52z"
    ></path>
  </g>
</svg>
```

The only change is adding `pathLength="1"` to both `<path>` elements. This normalises the path length so CSS can use `stroke-dasharray: 1` and `stroke-dashoffset: 1` without needing to calculate actual path lengths.

- [ ] **Step 2: Add animation classes to Footer.astro**

In `apps/web/src/components/Footer.astro`, change lines 52-55. The signature SVG gets `signature-draw` and the copyright `<span>` gets `signature-draw-delay`.

Change from:

```astro
<div class="flex items-center gap-3 font-sans text-xs text-[var(--color-muted)]">
  <Signature class="h-5 w-auto text-[var(--color-muted)]" />
  <span>&copy; {currentYear}</span>
</div>
```

to:

```astro
<div class="flex items-center gap-3 font-sans text-xs text-[var(--color-muted)]">
  <Signature class="signature-draw h-5 w-auto text-[var(--color-muted)]" />
  <span class="signature-draw-delay">&copy; {currentYear}</span>
</div>
```

- [ ] **Step 3: Verify the signature draw animation**

Run: `pnpm dev`

Open the site in Chrome/Edge/Safari. Scroll to the footer. The signature should:

1. Draw itself stroke-by-stroke over ~2 seconds as it enters the viewport
2. Fill in after the stroke completes
3. The `© 2026` text fades in with a slight delay

In Firefox: the signature should appear normally with no animation (static, as before).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/icons/Signature.astro apps/web/src/components/Footer.astro
git commit -m "feat: add signature draw-on animation in footer"
```

---

### Task 3: Hero entrance animation

**Files:**

- Modify: `apps/web/src/components/Hero.astro`

- [ ] **Step 1: Add animation classes to Hero.astro**

Replace the full content of `apps/web/src/components/Hero.astro` with:

```astro
---
interface Props {
  title?: string;
  highlight?: string;
  subtitle?: string;
}

const {
  title = 'I lead teams, ship code, and try to leave things',
  highlight = 'better than I found them',
  subtitle = "Faster delivery. Higher quality. Engineers who hit the career goals they set for themselves. That's the job — and I still write code because you can't lead what you don't understand.",
} = Astro.props;
---

<section class="pb-16 pt-8 md:pb-24 md:pt-16">
  <h1 class="font-700 font-sans text-4xl leading-tight md:text-5xl">
    <span class="hero-title inline-block">{title}</span>
    <span class="hero-accent inline-block text-[var(--color-accent)]">{highlight}</span>
  </h1>
  <p class="hero-subtitle mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
    {subtitle}
  </p>
</section>
```

Changes from original:

- Title text wrapped in `<span class="hero-title inline-block">` for independent animation
- Accent highlight gets class `hero-accent inline-block` (was just `text-[var(--color-accent)]`)
- Subtitle `<p>` gets class `hero-subtitle`

The `inline-block` is needed because `translate` does not work on inline elements.

- [ ] **Step 2: Verify the hero entrance**

Run: `pnpm dev`

Open the homepage. The hero should:

1. Title text fades up first
2. Coral accent phrase follows ~0.2s later
3. Subtitle paragraph fades up ~0.6s after page load
4. All animations complete within ~1.1s total

Hard-refresh (Cmd+Shift+R) to replay the animation. Navigate away and back — the animation should replay via Astro view transitions reloading the page.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Hero.astro
git commit -m "feat: add staggered hero entrance animation on homepage"
```

---

### Task 4: Scroll reveals on content elements

**Files:**

- Modify: `apps/web/src/pages/index.astro`
- Modify: `apps/web/src/components/PostPreview.astro`
- Modify: `apps/web/src/components/ProjectPreview.astro`
- Modify: `apps/web/src/pages/blog/[id].astro`
- Modify: `apps/web/src/pages/projects/[id].astro`
- Modify: `apps/web/src/pages/[...id].astro`

- [ ] **Step 1: Add `.reveal` to homepage sections in index.astro**

In `apps/web/src/pages/index.astro`, add `reveal` class to the two section headings and the section containers.

Change line 23 (Featured Projects heading) from:

```astro
<h2 class="font-600 mb-8 font-sans text-sm uppercase tracking-widest text-[var(--color-accent)]"></h2>
```

to:

```astro
<h2 class="reveal font-600 mb-8 font-sans text-sm uppercase tracking-widest text-[var(--color-accent)]"></h2>
```

Change line 41 (Writing heading) from:

```astro
<h2 class="font-600 mb-8 font-sans text-sm uppercase tracking-widest text-[var(--color-accent)]">Writing</h2>
```

to:

```astro
<h2 class="reveal font-600 mb-8 font-sans text-sm uppercase tracking-widest text-[var(--color-accent)]">Writing</h2>
```

- [ ] **Step 2: Add `.reveal` to PostPreview.astro**

In `apps/web/src/components/PostPreview.astro`, change line 12 from:

```astro
<article class="border-b border-[var(--color-border)] py-6"></article>
```

to:

```astro
<article class="reveal border-b border-[var(--color-border)] py-6"></article>
```

- [ ] **Step 3: Add `.reveal` to ProjectPreview.astro**

In `apps/web/src/components/ProjectPreview.astro`, change line 12 from:

```astro
<article class="group border border-[var(--color-border)] p-6 transition-colors hover:border-[var(--color-accent)]">
</article>
```

to:

```astro
<article
  class="reveal group border border-[var(--color-border)] p-6 transition-colors hover:border-[var(--color-accent)]"
>
</article>
```

- [ ] **Step 4: Add `.reveal` to blog post detail page**

In `apps/web/src/pages/blog/[id].astro`, change line 37 from:

```astro
<div class="prose prose-lg max-w-none"></div>
```

to:

```astro
<div class="reveal prose prose-lg max-w-none"></div>
```

- [ ] **Step 5: Add `.reveal` to project detail page**

In `apps/web/src/pages/projects/[id].astro`, change line 62 from:

```astro
<div class="prose prose-lg max-w-none"></div>
```

to:

```astro
<div class="reveal prose prose-lg max-w-none"></div>
```

- [ ] **Step 6: Add `.reveal` to generic pages**

In `apps/web/src/pages/[...id].astro`, change line 19 from:

```astro
<div class="prose prose-lg max-w-none"></div>
```

to:

```astro
<div class="reveal prose prose-lg max-w-none"></div>
```

- [ ] **Step 7: Verify scroll reveals**

Run: `pnpm dev`

Open the homepage in Chrome/Edge/Safari. Scroll down:

- Section headings should gently fade up as they enter the viewport
- Post previews and project cards should fade up individually
- The animation should feel early/natural — elements appear before you "reach" them

Navigate to a blog post — the prose content wrapper should fade in.

In Firefox: all content should be immediately visible with no animation.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/pages/index.astro apps/web/src/components/PostPreview.astro apps/web/src/components/ProjectPreview.astro apps/web/src/pages/blog/\[id\].astro apps/web/src/pages/projects/\[id\].astro apps/web/src/pages/\[...id\].astro
git commit -m "feat: add subtle scroll reveal animations to content elements"
```

---

### Task 5: Enhanced micro-interactions

**Files:**

- Modify: `apps/web/src/components/Button.astro`
- Modify: `apps/web/src/components/ProjectPreview.astro`
- Modify: `apps/web/src/components/PostPreview.astro`
- Modify: `apps/web/src/components/NavLink.astro`

- [ ] **Step 1: Add active press to Button.astro**

In `apps/web/src/components/Button.astro`, change line 13 from:

```astro
'inline-block border-2 border-[var(--color-accent)] px-6 py-2.5 font-sans text-sm font-600 text-[var(--color-accent)]
no-underline transition-all hover:bg-[var(--color-accent)] hover:text-white',
```

to:

```astro
'inline-block border-2 border-[var(--color-accent)] px-6 py-2.5 font-sans text-sm font-600 text-[var(--color-accent)]
no-underline transition-all hover:bg-[var(--color-accent)] hover:text-white motion-safe:active:scale-[0.98]',
```

- [ ] **Step 2: Add card lift to ProjectPreview.astro**

In `apps/web/src/components/ProjectPreview.astro`, change line 12 from:

```astro
<article
  class="reveal group border border-[var(--color-border)] p-6 transition-colors hover:border-[var(--color-accent)]"
>
</article>
```

to:

```astro
<article
  class="reveal group border border-[var(--color-border)] p-6 transition-all hover:border-[var(--color-accent)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md"
>
</article>
```

Note: `transition-colors` changed to `transition-all` to cover the translate and shadow. `hover:-translate-y-0.5` is Tailwind for `translate: 0 -2px`. `hover:shadow-md` adds a soft box-shadow.

- [ ] **Step 3: Add arrow slide-in to PostPreview.astro**

In `apps/web/src/components/PostPreview.astro`, change lines 14-17 from:

```astro
<h3 class="font-600 font-sans text-lg text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]">
  {post.data.title}
</h3>
```

to:

```astro
<h3 class="font-600 font-sans text-lg text-[var(--color-fg)] transition-colors group-hover:text-[var(--color-accent)]">
  {post.data.title}
  <span
    class="inline-block translate-x-0 opacity-0 transition-all motion-safe:group-hover:translate-x-1 motion-safe:group-hover:opacity-100"
    aria-hidden="true">&nbsp;&rarr;</span
  >
</h3>
```

This adds a `→` arrow that starts invisible and shifted left, then slides in and appears on hover. The `aria-hidden="true"` keeps it decorative.

- [ ] **Step 4: Add animated underline to NavLink.astro**

Replace the full content of `apps/web/src/components/NavLink.astro` with:

```astro
---
interface Props {
  href: string;
  class?: string;
}

const { href, class: className } = Astro.props;
const isActive = Astro.url.pathname === href || (href !== '/' && Astro.url.pathname.startsWith(href));
---

<a
  href={href}
  class:list={[
    'nav-link-underline font-600 font-sans text-sm no-underline',
    isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]',
    className,
  ]}
>
  <slot />
</a>
```

Changes from original:

- Added `nav-link-underline` class (defined in global.css Task 1)
- Added `no-underline` to prevent default text-decoration from conflicting
- Removed `transition-colors` (the `.nav-link-underline` class in global.css handles its own transitions)

- [ ] **Step 5: Verify all micro-interactions**

Run: `pnpm dev`

Test each interaction:

1. **Buttons:** Click "All projects" or "All posts" — should have a subtle press-down feel
2. **Project cards:** Hover over a project card — should lift slightly with a soft shadow, border still changes to accent
3. **Post previews:** Hover over a blog post — title changes to accent AND a `→` arrow slides in
4. **Nav links:** Hover over nav links — an underline should draw in from the left

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/Button.astro apps/web/src/components/ProjectPreview.astro apps/web/src/components/PostPreview.astro apps/web/src/components/NavLink.astro
git commit -m "feat: add micro-interactions — button press, card lift, arrow slide, nav underline"
```

---

### Task 6: Enhanced page transitions

**Files:**

- Modify: `apps/web/src/components/Nav.astro`

The view transition CSS was already added to `global.css` in Task 1 (the `::view-transition-old(root)` and `::view-transition-new(root)` keyframes). This task just needs to persist the nav during transitions.

- [ ] **Step 1: Add `transition:persist` to Nav.astro**

In `apps/web/src/components/Nav.astro`, change line 8 from:

```astro
<nav class="bg-[var(--color-bg)]/90 sticky top-0 z-50 border-b border-[var(--color-border)] backdrop-blur-md"></nav>
```

to:

```astro
<nav
  transition:persist
  class="bg-[var(--color-bg)]/90 sticky top-0 z-50 border-b border-[var(--color-border)] backdrop-blur-md"
>
</nav>
```

This tells Astro's view transitions to keep the nav element in place during page transitions rather than including it in the page-level animation.

- [ ] **Step 2: Verify page transitions**

Run: `pnpm dev`

Navigate between pages (e.g., homepage → blog → a blog post → back):

1. The outgoing page should slide down slightly and fade out
2. The incoming page should fade up into place
3. The nav should stay anchored — no flickering or animation
4. Total transition duration should feel snappy (~250ms)

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/Nav.astro
git commit -m "feat: add custom page transitions with persistent nav"
```

---

### Task 7: Final verification and cleanup

**Files:** None (verification only)

- [ ] **Step 1: Full walkthrough in a supported browser (Chrome/Edge/Safari)**

Run: `pnpm dev`

Walk through the complete experience:

1. **Homepage load:** Hero text staggers in (title → accent → subtitle)
2. **Scroll down:** Section headings and content cards gently fade up
3. **Hover project card:** Card lifts with shadow, border goes accent, arrow slides right
4. **Hover blog post:** Title goes accent, arrow slides in
5. **Hover nav links:** Underline draws in from left
6. **Click button:** Subtle press feel
7. **Navigate to a blog post:** Custom slide transition, nav stays put
8. **Scroll to footer (any page):** Signature draws itself, copyright fades in

- [ ] **Step 2: Verify Firefox graceful degradation**

Open the site in Firefox:

1. All content should be immediately visible — no invisible/hidden elements
2. No scroll reveal animations (content just appears)
3. No signature draw animation (signature shows normally)
4. Hero entrance still works (standard CSS animation, not scroll-triggered)
5. Hover effects still work (standard CSS transitions)
6. Page transitions still work (view transitions are supported in Firefox)

- [ ] **Step 3: Verify reduced motion**

In your OS, enable "Reduce motion" (macOS: System Settings → Accessibility → Display → Reduce motion). Reload the site:

1. No hero entrance animation — text is immediately visible
2. No scroll reveals — all content visible immediately
3. No signature draw — signature appears normally
4. No page transition animations — instant navigation
5. Hover effects reduced to color changes only (no card lift, no arrow slide)
6. Nav underline still appears on hover (instant, no draw-in)

- [ ] **Step 4: Build check**

Run: `pnpm build`

Expected: Build completes with no errors. All pages generate successfully.

- [ ] **Step 5: Commit any fixes**

If any fixes were needed during verification, commit them:

```bash
git add -A
git commit -m "fix: polish animation edge cases from final verification"
```

If no fixes were needed, skip this step.
