# Mobile Menu Redesign

## Overview

Redesign the mobile navigation menu on jasonmatthew.dev to replace the current instant-toggle dropdown with a polished, centred, animated panel that includes a subtle tagline.

## Current State

- Mobile menu is a basic dropdown toggled via `hidden` class (instant show/hide)
- Left-aligned links, small font (`text-sm`), minimal spacing
- No animation on open/close
- No close icon — hamburger doesn't change state
- No focus trap or Escape key handling
- Accessible basics in place (`aria-expanded`, `aria-controls`, `aria-label`)

## Design

### Layout

- **Centred links**: `text-center` with `items-center` on the flex column
- **Font size**: Bump from `text-sm` (0.875rem) to `text-base` (1rem)
- **Letter-spacing**: Subtle `tracking-wide` (0.025em) on nav links within the mobile menu
- **Vertical gap**: Increase from `gap-3` to `gap-5` (20px) for generous spacing
- **Padding**: `px-4 py-6` for the menu panel — more vertical breathing room
- **Tagline**: Below the links, separated by a thin `border-t border-[var(--color-border)]` divider with `pt-4 mt-4`. Text: site tagline from `site-config.ts`. Styled as `text-xs uppercase tracking-widest text-[var(--color-muted)]`

### Animation

- **Open**: Transition from `max-height: 0; opacity: 0` to `max-height: <computed>; opacity: 1` over 300ms with `ease-out` timing
- **Close**: Reverse — `max-height` and `opacity` transition back to 0 over 200ms with `ease-in` timing
- **Overflow**: `overflow-hidden` on the menu container to clip content during height transition
- **Implementation**: Replace `hidden` class toggle with CSS transition classes. Use `max-height` with a generous ceiling value (e.g. `20rem`) rather than computed height for simplicity
- **Reduced motion**: Under `prefers-reduced-motion: reduce`, skip transitions — instant toggle via `opacity` only (no height animation)

### Hamburger → X Animation

- When menu is closed: standard 3-line hamburger icon
- When menu is open: animate to an X (close icon)
- Implementation: Use the existing SVG in `Menu.astro` or replace with 3 `<span>` bars that can be rotated via CSS transforms
- Transition: 200ms transform + opacity on the bars
- Middle bar fades out, top/bottom bars rotate ±45° and translate to form the X

### Accessibility

- **Focus trap**: When menu opens, trap Tab/Shift+Tab within the menu panel (cycle through nav links + close button). Restore focus to toggle button on close
- **Escape key**: Close menu and return focus to toggle button
- **Existing ARIA**: Preserve `aria-expanded`, `aria-controls="mobile-menu"`, `aria-label="Toggle menu"`
- **Reduced motion**: Respect `prefers-reduced-motion` as described above

## Files to Modify

1. **`apps/web/src/components/Nav.astro`** — Menu markup, layout classes, JS for animation/focus trap/escape
2. **`apps/web/src/styles/global.css`** — Transition styles for menu panel, hamburger animation, reduced motion overrides
3. **`apps/web/src/components/NavLink.astro`** — Possibly adjust mobile-specific styles (letter-spacing, size) if not handled in Nav.astro
4. **`apps/web/src/icons/Menu.astro`** — Replace SVG with animatable bar spans, or keep SVG and add open-state variant

## What Does NOT Change

- Desktop navigation (hidden on mobile, unaffected)
- Navigation links or their order (from `site-config.ts`)
- Sticky glassmorphic nav bar styling
- Active link accent colour behaviour
- Theme toggle position (stays in nav bar)
- Breakpoint (`sm:` for desktop switch)
- `NavLink.astro` underline animation on desktop

## Success Criteria

- Menu opens/closes with smooth slide + fade animation
- Links are centred with generous spacing and subtle letter-spacing
- Tagline appears below links with divider
- Hamburger animates to X when open
- Focus is trapped in open menu, Escape closes it
- `prefers-reduced-motion` disables animations gracefully
- No layout shift or flash on open/close
- Works correctly with Astro page transitions (`astro:page-load`)
