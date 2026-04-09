# Mobile Menu Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the instant-toggle mobile menu with a polished, centred, animated dropdown featuring smooth slide/fade transitions, hamburger-to-X animation, a subtle tagline, and proper focus management.

**Architecture:** All changes are contained within the existing Nav component and global CSS. The hamburger SVG is replaced with CSS-animated `<span>` bars directly in `Nav.astro`. Menu open/close uses CSS transitions on `max-height` and `opacity` instead of toggling `hidden`. Focus trap and Escape key handling added to the existing JS block.

**Tech Stack:** Astro 5, Tailwind CSS v4, vanilla JS

**Spec:** `docs/superpowers/specs/2026-04-10-mobile-menu-redesign.md`

---

### Task 1: Add mobile menu CSS transitions, hamburger animation, and mobile nav link overrides

**Files:**

- Modify: `apps/web/src/styles/global.css`

- [ ] **Step 1: Add mobile menu transition styles after the nav-link-underline section**

Insert the following after line 310 (after `.nav-link-underline:hover { background-size: 100% 2px; }`) and before the `/* ─── Reduced Motion ───` comment:

```css
/* ─── Mobile Menu Transitions ────────────────────────────── */

.mobile-menu {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    max-height 0.3s ease-out,
    opacity 0.3s ease-out;
}

.mobile-menu.is-open {
  max-height: 20rem;
  opacity: 1;
}

/* ─── Mobile Menu Nav Link Overrides ─────────────────────── */

#mobile-menu .nav-link-underline {
  font-size: 1rem;
  letter-spacing: 0.025em;
}

/* ─── Hamburger → X Animation ────────────────────────────── */

.hamburger-bar {
  position: absolute;
  display: block;
  width: 18px;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.hamburger-bar:nth-child(1) {
  transform: translateY(-6px);
}

.hamburger-bar:nth-child(3) {
  transform: translateY(6px);
}

[aria-expanded='true'] .hamburger-bar:nth-child(1) {
  transform: rotate(45deg);
}

[aria-expanded='true'] .hamburger-bar:nth-child(2) {
  opacity: 0;
}

[aria-expanded='true'] .hamburger-bar:nth-child(3) {
  transform: rotate(-45deg);
}
```

- [ ] **Step 2: Add reduced-motion overrides for the new transitions**

Inside the existing `@media (prefers-reduced-motion: reduce)` block (before the closing `}`), add:

```css
.mobile-menu {
  transition: none;
}

.hamburger-bar {
  transition: none;
}
```

- [ ] **Step 3: Verify the CSS compiles**

Run: `pnpm -F @jasonmatthew/web build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/styles/global.css
git commit -m "style: add mobile menu transitions, hamburger animation, and mobile nav overrides"
```

---

### Task 2: Replace hamburger SVG with animatable bars and update menu markup

**Files:**

- Modify: `apps/web/src/components/Nav.astro` (template section, lines 1-48)

- [ ] **Step 1: Replace the inline SVG hamburger with three `<span>` bars**

In `apps/web/src/components/Nav.astro`, replace lines 21-39 (the button's class attribute through the closing `</svg>` tag) so the full button reads:

```astro
<button
  id="mobile-menu-toggle"
  type="button"
  class="relative flex h-9 w-9 items-center justify-center text-[var(--color-muted)] sm:hidden"
  aria-label="Toggle menu"
  aria-expanded="false"
  aria-controls="mobile-menu"
>
  <span class="hamburger-bar"></span>
  <span class="hamburger-bar"></span>
  <span class="hamburger-bar"></span>
</button>
```

Note: `relative` added to the button class so the `position: absolute` bars are positioned within it.

- [ ] **Step 2: Update the mobile menu container markup**

Replace lines 43-47 (the `<div id="mobile-menu"` block through its closing `</div>`) with:

```astro
<div id="mobile-menu" class="mobile-menu border-t border-[var(--color-border)] sm:hidden">
  <div class="flex flex-col items-center gap-5 px-4 py-6 text-center">
    {siteConfig.headerNavLinks.map((link) => <NavLink href={link.href}>{link.text}</NavLink>)}
    <div class="mt-4 w-full border-t border-[var(--color-border)] pt-4 text-center">
      <span class="text-xs uppercase tracking-widest text-[var(--color-muted)]">
        {siteConfig.subtitle}
      </span>
    </div>
  </div>
</div>
```

Key changes from the old markup:

- `hidden` class removed — visibility now controlled by CSS `max-height`/`opacity` via `mobile-menu` class
- `sm:hidden` kept to hide on desktop
- Links centred with `items-center text-center`
- `gap-5` and `py-6` for generous spacing
- Font size and letter-spacing overridden via CSS in global.css (`#mobile-menu .nav-link-underline`)
- Tagline section added with divider

- [ ] **Step 3: Verify the template renders**

Run: `pnpm -F @jasonmatthew/web build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/Nav.astro
git commit -m "feat: update mobile menu markup with centred layout, tagline, and hamburger bars"
```

---

### Task 3: Update JS for animated open/close, focus trap, and Escape key

**Files:**

- Modify: `apps/web/src/components/Nav.astro` (script section, lines 50-67)

- [ ] **Step 1: Replace the entire `<script>` block with the new implementation**

Replace the `<script>` block (lines 50-67) in `Nav.astro` with:

```astro
<script>
  function setupMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    // Ensure menu is closed on page load (Astro view transitions keep DOM state)
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');

    function openMenu() {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.addEventListener('keydown', onKeyDown);
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('keydown', onKeyDown);
      toggle.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = menu.querySelectorAll<HTMLElement>('a, button');
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  document.addEventListener('astro:page-load', setupMobileMenu);
</script>
```

Key changes:

- `hidden` class toggle replaced with `is-open` class toggle (drives CSS transitions)
- `openMenu()`/`closeMenu()` functions for clear state management
- `onKeyDown` handler: Escape closes menu, Tab/Shift+Tab trapped within focusable elements
- Event listener cleanup on close to avoid leaks
- Focus returned to toggle button on close

- [ ] **Step 2: Verify the full component builds**

Run: `pnpm -F @jasonmatthew/web build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Manual verification in dev server**

Run: `pnpm dev`

Verify in browser at mobile viewport (< 640px):

1. Hamburger icon visible, menu hidden (max-height 0, not visible)
2. Click hamburger → menu slides down smoothly, hamburger animates to X
3. Links are centred with generous spacing and larger font size
4. Tagline "Leading teams, shipping code, leaving things better" appears below links with divider
5. Click X → menu slides up smoothly, X animates back to hamburger
6. Press Escape → menu closes, focus returns to hamburger button
7. Tab through open menu → focus cycles within menu links
8. Navigate to a page → menu closes on page load
9. Toggle dark mode → menu respects theme colours
10. Enable reduced motion in OS → transitions are instant (no slide, no hamburger animation)
11. Resize to desktop (≥ 640px) → mobile menu and hamburger are hidden, desktop nav shows

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/Nav.astro
git commit -m "feat: add animated mobile menu with focus trap and escape key support"
```
