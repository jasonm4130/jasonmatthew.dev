# OG Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate unique, branded OG images for every blog post and project at build time using Satori + resvg-js, replacing the existing Playwright-based asset generation.

**Architecture:** A Node.js script (`scripts/generate-og-images.mjs`) reads MDX frontmatter from `packages/content/`, renders OG images via Satori templates, and outputs PNGs to `apps/web/public/og/`. BaseHead.astro auto-resolves the OG path from the current page URL. A pre-commit hook regenerates images when content changes.

**Tech Stack:** satori, satori-html, @resvg/resvg-js, gray-matter, Sora font (TTF)

---

## File Structure

```
scripts/
  generate-og-images.mjs          # Main orchestrator script
  og-templates/
    fonts/
      Sora-Regular.ttf             # Bundled font (regular weight)
      Sora-Bold.ttf                # Bundled font (bold weight)
    render.mjs                     # Shared rendering utility (satori + resvg)
    blog.mjs                       # Blog post OG template
    project.mjs                    # Project OG template
    default.mjs                    # Default/homepage OG template
    favicon.mjs                    # Favicon + apple-touch-icon generation

apps/web/
  src/components/BaseHead.astro    # Modified — auto-resolve OG path
  public/og/                       # Generated output directory
    default.png
    blog/<slug>.png
    projects/<slug>.png
```

---

### Task 1: Install dependencies and download fonts

**Files:**
- Modify: `package.json` (root)
- Create: `scripts/og-templates/fonts/Sora-Regular.ttf`
- Create: `scripts/og-templates/fonts/Sora-Bold.ttf`

- [ ] **Step 1: Install npm dependencies**

Run:
```bash
pnpm add -Dw satori satori-html @resvg/resvg-js gray-matter
```

- [ ] **Step 2: Create fonts directory and download Sora TTF files**

Run:
```bash
mkdir -p scripts/og-templates/fonts
curl -L -o scripts/og-templates/fonts/Sora-Regular.ttf "https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-400-normal.ttf"
curl -L -o scripts/og-templates/fonts/Sora-Bold.ttf "https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-700-normal.ttf"
```

Verify both files are non-empty:
```bash
ls -la scripts/og-templates/fonts/
```

Expected: Two `.ttf` files, each 20-60KB.

If the fontsource CDN URLs don't work, download Sora manually from [Google Fonts](https://fonts.google.com/specimen/Sora) — extract `Sora-Regular.ttf` and `Sora-Bold.ttf` from the zip into `scripts/og-templates/fonts/`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/og-templates/fonts/
git commit -m "chore: add satori, resvg-js, gray-matter and Sora fonts for OG generation"
```

---

### Task 2: Create shared rendering utility

**Files:**
- Create: `scripts/og-templates/render.mjs`

- [ ] **Step 1: Create render.mjs**

```js
// scripts/og-templates/render.mjs
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';

const soraRegular = readFileSync(
  new URL('./fonts/Sora-Regular.ttf', import.meta.url),
);
const soraBold = readFileSync(
  new URL('./fonts/Sora-Bold.ttf', import.meta.url),
);

/**
 * Render a satori-html VNode to a PNG buffer.
 * @param {import('satori-html').VNode} markup - Output of satori-html's html``
 * @param {{ width?: number, height?: number }} options
 * @returns {Promise<Buffer>}
 */
export async function renderToPng(markup, { width = 1200, height = 630 } = {}) {
  const svg = await satori(markup, {
    width,
    height,
    fonts: [
      { name: 'Sora', data: soraRegular, weight: 400, style: 'normal' },
      { name: 'Sora', data: soraBold, weight: 700, style: 'normal' },
    ],
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  return resvg.render().asPng();
}
```

- [ ] **Step 2: Verify it loads without errors**

Run:
```bash
node -e "import('./scripts/og-templates/render.mjs').then(() => console.log('OK'))"
```

Expected: `OK` (no import errors)

- [ ] **Step 3: Commit**

```bash
git add scripts/og-templates/render.mjs
git commit -m "feat: add shared satori rendering utility"
```

---

### Task 3: Create OG templates (blog, project, default)

**Files:**
- Create: `scripts/og-templates/blog.mjs`
- Create: `scripts/og-templates/project.mjs`
- Create: `scripts/og-templates/default.mjs`

- [ ] **Step 1: Create blog.mjs**

```js
// scripts/og-templates/blog.mjs
import { html } from 'satori-html';

/**
 * @param {{ title: string, date: string, tags: string[] }} data
 */
export function blogTemplate({ title, date, tags }) {
  const tagPills = tags
    .slice(0, 4)
    .map(
      (tag) =>
        `<span style="background:#1e1e1e;color:#e8553d;padding:6px 16px;border-radius:6px;font-size:16px;">${tag}</span>`,
    )
    .join('');

  return html`
    <div
      style="display:flex;flex-direction:column;width:100%;height:100%;background:#121212;padding:48px;font-family:Sora;"
    >
      <div
        style="display:flex;position:absolute;top:0;left:0;right:0;height:6px;background:#e8553d;"
      ></div>
      <div
        style="display:flex;justify-content:space-between;align-items:center;"
      >
        <span
          style="color:#f0f0f0;font-size:18px;opacity:0.6;letter-spacing:2px;"
          >JASONMATTHEW.DEV</span
        >
        <span style="color:#e8553d;font-size:18px;">Blog</span>
      </div>
      <div
        style="display:flex;flex:1;flex-direction:column;justify-content:center;"
      >
        <div
          style="display:flex;color:#f0f0f0;font-size:48px;font-weight:700;line-height:1.2;"
        >
          ${title}
        </div>
        <div
          style="display:flex;color:#f0f0f0;opacity:0.5;font-size:20px;margin-top:16px;"
        >
          ${date}
        </div>
      </div>
      <div style="display:flex;gap:12px;">${tagPills}</div>
    </div>
  `;
}
```

- [ ] **Step 2: Create project.mjs**

```js
// scripts/og-templates/project.mjs
import { html } from 'satori-html';

/**
 * @param {{ title: string, description: string, technologies: string[] }} data
 */
export function projectTemplate({ title, description, technologies }) {
  const techBadges = technologies
    .slice(0, 5)
    .map(
      (tech) =>
        `<span style="background:#1e1e1e;color:#e8553d;padding:6px 16px;border-radius:6px;font-size:16px;">${tech}</span>`,
    )
    .join('');

  return html`
    <div
      style="display:flex;flex-direction:column;width:100%;height:100%;background:#121212;padding:48px;font-family:Sora;"
    >
      <div
        style="display:flex;position:absolute;top:0;left:0;right:0;height:6px;background:#e8553d;"
      ></div>
      <div
        style="display:flex;justify-content:space-between;align-items:center;"
      >
        <span
          style="color:#f0f0f0;font-size:18px;opacity:0.6;letter-spacing:2px;"
          >JASONMATTHEW.DEV</span
        >
        <span style="color:#e8553d;font-size:18px;">Project</span>
      </div>
      <div
        style="display:flex;flex:1;flex-direction:column;justify-content:center;"
      >
        <div
          style="display:flex;color:#f0f0f0;font-size:48px;font-weight:700;line-height:1.2;"
        >
          ${title}
        </div>
        <div
          style="display:flex;color:#f0f0f0;opacity:0.5;font-size:20px;margin-top:16px;line-height:1.4;"
        >
          ${description}
        </div>
      </div>
      <div style="display:flex;gap:12px;">${techBadges}</div>
    </div>
  `;
}
```

- [ ] **Step 3: Create default.mjs**

```js
// scripts/og-templates/default.mjs
import { html } from 'satori-html';

/**
 * Default OG card — used for homepage and static pages.
 * Shows branding: name, subtitle, URL.
 */
export function defaultTemplate() {
  return html`
    <div
      style="display:flex;flex-direction:column;width:100%;height:100%;background:#121212;padding:48px;font-family:Sora;"
    >
      <div
        style="display:flex;position:absolute;top:0;left:0;right:0;height:6px;background:#e8553d;"
      ></div>
      <div style="display:flex;flex:1;flex-direction:column;justify-content:center;align-items:center;">
        <div
          style="display:flex;color:#f0f0f0;font-size:64px;font-weight:700;"
        >
          Jason Matthew
        </div>
        <div
          style="display:flex;color:#f0f0f0;opacity:0.5;font-size:24px;margin-top:20px;"
        >
          Engineering Manager &amp; Builder
        </div>
      </div>
      <div style="display:flex;justify-content:center;">
        <span
          style="color:#e8553d;font-size:18px;letter-spacing:2px;"
          >JASONMATTHEW.DEV</span
        >
      </div>
    </div>
  `;
}
```

- [ ] **Step 4: Verify templates produce valid markup**

Run:
```bash
node -e "
import { blogTemplate } from './scripts/og-templates/blog.mjs';
const m = blogTemplate({ title: 'Test Post', date: '18 April 2026', tags: ['test'] });
console.log('Blog VNode type:', m.type);

import { projectTemplate } from './scripts/og-templates/project.mjs';
const p = projectTemplate({ title: 'Test', description: 'Desc', technologies: ['Node'] });
console.log('Project VNode type:', p.type);

import { defaultTemplate } from './scripts/og-templates/default.mjs';
const d = defaultTemplate();
console.log('Default VNode type:', d.type);
"
```

Expected: Three lines showing VNode types (e.g., `div`), no errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/og-templates/blog.mjs scripts/og-templates/project.mjs scripts/og-templates/default.mjs
git commit -m "feat: add OG image templates for blog, project, and default"
```

---

### Task 4: Create favicon and static asset generation

**Files:**
- Create: `scripts/og-templates/favicon.mjs`

The current `generate-assets.mjs` generates favicons by screenshotting the JM lettermark SVG in Playwright. We replicate this using Satori for the PNGs and a template string for the SVG (which needs a `prefers-color-scheme` media query that Satori can't produce).

- [ ] **Step 1: Create favicon.mjs**

```js
// scripts/og-templates/favicon.mjs
import { html } from 'satori-html';
import { readFileSync } from 'node:fs';

const lettermarkSvg = readFileSync(
  new URL('../../apps/web/public/jm-lettermark.svg', import.meta.url),
  'utf-8',
);
const lettermarkDataUri = `data:image/svg+xml;base64,${Buffer.from(lettermarkSvg).toString('base64')}`;

/**
 * Favicon template — renders JM lettermark on dark background.
 * Used for favicon-512.png and apple-touch-icon.png (different sizes).
 */
export function faviconTemplate() {
  return html`
    <div
      style="display:flex;width:100%;height:100%;background:#121212;align-items:center;justify-content:center;border-radius:20%;"
    >
      <img src="${lettermarkDataUri}" width="70%" height="70%" />
    </div>
  `;
}

/**
 * Generate favicon.svg with prefers-color-scheme support.
 * Returns raw SVG string (not rendered via Satori — needs media query).
 */
export function faviconSvgContent() {
  // Extract just the SVG content (paths) from the lettermark
  // Wrap in an SVG with background rect that responds to color scheme
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <style>
    rect { fill: #121212; }
    .mark { fill: #f0f0f0; }
    @media (prefers-color-scheme: light) {
      rect { fill: #faf8f5; }
      .mark { fill: #111111; }
    }
  </style>
  <rect width="512" height="512" rx="102" ry="102"/>
  <g class="mark" transform="translate(76, 76) scale(0.7)">
    ${extractPaths(lettermarkSvg)}
  </g>
</svg>`;
}

/**
 * Extract <path> and <g> elements from an SVG string.
 */
function extractPaths(svgString) {
  const match = svgString.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return match ? match[1].replace(/fill="[^"]*"/g, '') : '';
}
```

- [ ] **Step 2: Verify favicon template loads**

Run:
```bash
node -e "
import { faviconTemplate, faviconSvgContent } from './scripts/og-templates/favicon.mjs';
const f = faviconTemplate();
console.log('Favicon VNode type:', f.type);
const svg = faviconSvgContent();
console.log('SVG length:', svg.length, 'starts with <svg:', svg.startsWith('<svg'));
"
```

Expected: VNode type is `div`, SVG is a non-empty string starting with `<svg`.

- [ ] **Step 3: Commit**

```bash
git add scripts/og-templates/favicon.mjs
git commit -m "feat: add favicon generation templates (replaces Playwright)"
```

---

### Task 5: Create main generation script

**Files:**
- Create: `scripts/generate-og-images.mjs`

- [ ] **Step 1: Create generate-og-images.mjs**

```js
// scripts/generate-og-images.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import { renderToPng } from './og-templates/render.mjs';
import { blogTemplate } from './og-templates/blog.mjs';
import { projectTemplate } from './og-templates/project.mjs';
import { defaultTemplate } from './og-templates/default.mjs';
import {
  faviconTemplate,
  faviconSvgContent,
} from './og-templates/favicon.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT_DIR = join(ROOT, 'packages/content');
const PUBLIC_DIR = join(ROOT, 'apps/web/public');

/**
 * Read all MDX files from a directory and parse frontmatter.
 */
function readContent(subdir) {
  const dir = join(CONTENT_DIR, subdir);
  let files;
  try {
    files = readdirSync(dir).filter(
      (f) => extname(f) === '.mdx' || extname(f) === '.md',
    );
  } catch {
    console.log(`  No content directory: ${subdir}`);
    return [];
  }
  return files.map((file) => {
    const raw = readFileSync(join(dir, file), 'utf-8');
    const { data } = matter(raw);
    const slug = basename(file, extname(file));
    return { slug, data };
  });
}

/**
 * Format a date for display on OG cards.
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Write a PNG buffer to disk, creating directories as needed.
 */
function writePng(relativePath, buffer) {
  const fullPath = join(PUBLIC_DIR, relativePath);
  mkdirSync(join(fullPath, '..'), { recursive: true });
  writeFileSync(fullPath, buffer);
  console.log(`  ✓ ${relativePath}`);
}

async function generateOgImages() {
  console.log('\nGenerating OG images...\n');

  // Blog posts
  const articles = readContent('articles');
  const publishedArticles = articles.filter(
    (a) => !a.data.draft && a.data.publishDate && new Date(a.data.publishDate) <= new Date(),
  );
  for (const { slug, data } of publishedArticles) {
    const markup = blogTemplate({
      title: data.title,
      date: formatDate(data.publishDate),
      tags: data.tags || [],
    });
    const png = await renderToPng(markup);
    writePng(`og/blog/${slug}.png`, png);
  }

  // Projects
  const projects = readContent('projects');
  const publishedProjects = projects.filter(
    (p) => !p.data.draft && p.data.publishDate && new Date(p.data.publishDate) <= new Date(),
  );
  for (const { slug, data } of publishedProjects) {
    const markup = projectTemplate({
      title: data.title,
      description: data.description || '',
      technologies: data.technologies || [],
    });
    const png = await renderToPng(markup);
    writePng(`og/projects/${slug}.png`, png);
  }

  // Default card
  const defaultMarkup = defaultTemplate();
  const defaultPng = await renderToPng(defaultMarkup);
  writePng('og/default.png', defaultPng);
}

async function generateFavicons() {
  console.log('Generating favicons...\n');

  // favicon-512.png
  const favicon512 = await renderToPng(faviconTemplate(), {
    width: 512,
    height: 512,
  });
  writePng('favicon-512.png', favicon512);

  // apple-touch-icon.png
  const appleTouchIcon = await renderToPng(faviconTemplate(), {
    width: 180,
    height: 180,
  });
  writePng('apple-touch-icon.png', appleTouchIcon);

  // favicon.svg
  const svgContent = faviconSvgContent();
  const svgPath = join(PUBLIC_DIR, 'favicon.svg');
  writeFileSync(svgPath, svgContent);
  console.log('  ✓ favicon.svg');
}

async function main() {
  const start = performance.now();
  await generateOgImages();
  await generateFavicons();
  const elapsed = ((performance.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s\n`);
}

main().catch((err) => {
  console.error('OG generation failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Run the script and verify output**

Run:
```bash
node scripts/generate-og-images.mjs
```

Expected output:
```
Generating OG images...

  ✓ og/blog/the-weekend-deploy.png
  ✓ og/blog/what-is-a-senior.png
  ... (one line per published article)
  ✓ og/projects/formrecap.png
  ... (one line per published project)
  ✓ og/default.png

Generating favicons...

  ✓ favicon-512.png
  ✓ apple-touch-icon.png
  ✓ favicon.svg

Done in X.Xs
```

- [ ] **Step 3: Visually inspect a generated image**

Run:
```bash
open apps/web/public/og/default.png
```

Verify: dark background, coral accent bar at top, "Jason Matthew" centered, subtitle below, URL at bottom.

Check a blog post image too:
```bash
ls apps/web/public/og/blog/
open apps/web/public/og/blog/$(ls apps/web/public/og/blog/ | head -1)
```

Verify: title, date, tags visible with correct styling.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-og-images.mjs
git commit -m "feat: add main OG image generation script"
```

---

### Task 6: Update BaseHead.astro for auto-resolution

**Files:**
- Modify: `apps/web/src/components/BaseHead.astro`

- [ ] **Step 1: Update image resolution logic**

In `apps/web/src/components/BaseHead.astro`, replace the existing `resolvedImage` logic (around lines 15-17):

Replace:
```typescript
const resolvedImage = image?.src
	? new URL(image.src, Astro.site).toString()
	: new URL('/og-default.jpg', Astro.site).toString();
```

With:
```typescript
function resolveOgImage(pathname: string, image?: { src: string }) {
	if (image?.src) return new URL(image.src, Astro.site).toString();

	let ogPath = '/og/default.png';
	const cleanPath = pathname.replace(/\/$/, '');
	if (cleanPath.startsWith('/blog/')) {
		ogPath = `/og/blog/${cleanPath.replace('/blog/', '')}.png`;
	} else if (cleanPath.startsWith('/projects/')) {
		ogPath = `/og/projects/${cleanPath.replace('/projects/', '')}.png`;
	}
	return new URL(ogPath, Astro.site).toString();
}

const resolvedImage = resolveOgImage(Astro.url.pathname, image);
```

- [ ] **Step 2: Build the site and verify meta tags**

Run:
```bash
pnpm -F @jasonmatthew/web build
```

Then check the output HTML for a blog post:
```bash
grep -i 'og:image' apps/web/dist/blog/the-weekend-deploy/index.html
```

Expected: `<meta property="og:image" content="https://jasonmatthew.dev/og/blog/the-weekend-deploy.png" />`

Check homepage:
```bash
grep -i 'og:image' apps/web/dist/index.html
```

Expected: `<meta property="og:image" content="https://jasonmatthew.dev/og/default.png" />`

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/BaseHead.astro
git commit -m "feat: auto-resolve OG image path from page URL"
```

---

### Task 7: Wire up build pipeline

**Files:**
- Modify: `package.json` (root) — add `generate:og` script
- Modify: `turbo.json` — add task dependency
- Modify: `.husky/pre-commit` — add content-change detection

- [ ] **Step 1: Add generate:og script to root package.json**

In `package.json`, add to the `"scripts"` object:

```json
"generate:og": "node scripts/generate-og-images.mjs"
```

- [ ] **Step 2: Add Turborepo task dependency**

In `turbo.json`, add a `generate:og` task and make `build` depend on it. Replace the existing `"build"` entry:

Replace:
```json
"build": {
  "dependsOn": ["^build"],
  "inputs": ["src/**", "public/**", "astro.config.*"],
  "outputs": ["dist/**", ".astro/**"]
}
```

With:
```json
"generate:og": {
  "inputs": ["scripts/**", "packages/content/**"],
  "outputs": ["apps/web/public/og/**", "apps/web/public/favicon-512.png", "apps/web/public/apple-touch-icon.png", "apps/web/public/favicon.svg"]
},
"build": {
  "dependsOn": ["^build", "generate:og"],
  "inputs": ["src/**", "public/**", "astro.config.*"],
  "outputs": ["dist/**", ".astro/**"]
}
```

- [ ] **Step 3: Update pre-commit hook**

Replace the contents of `.husky/pre-commit` with:

```bash
#!/bin/sh

# Regenerate OG images if content files changed
if git diff --cached --name-only | grep -q '^packages/content/'; then
  echo "Content changed — regenerating OG images..."
  pnpm generate:og
  git add apps/web/public/og/ apps/web/public/favicon-512.png apps/web/public/apple-touch-icon.png apps/web/public/favicon.svg
fi

npx lint-staged
```

- [ ] **Step 4: Verify the build pipeline**

Run:
```bash
pnpm build
```

Expected: `generate:og` runs first (cached if no content changes), then the Astro build completes successfully.

- [ ] **Step 5: Commit**

```bash
git add package.json turbo.json .husky/pre-commit
git commit -m "feat: wire up OG generation in build pipeline and pre-commit hook"
```

---

### Task 8: Generate all images, clean up Playwright, and verify

**Files:**
- Delete: `scripts/generate-assets.mjs`
- Modify: `package.json` (root) — remove `playwright` dependency
- Delete: `apps/web/public/og-default.jpg` (replaced by `og/default.png`)

- [ ] **Step 1: Run full generation**

Run:
```bash
pnpm generate:og
```

Verify all expected files exist:
```bash
ls -la apps/web/public/og/default.png
ls apps/web/public/og/blog/ | wc -l
ls apps/web/public/og/projects/ | wc -l
ls -la apps/web/public/favicon-512.png
ls -la apps/web/public/apple-touch-icon.png
ls -la apps/web/public/favicon.svg
```

Expected: `default.png` exists, blog count matches published articles, project count matches published projects, all favicon files exist.

- [ ] **Step 2: Remove old Playwright script and dependency**

Run:
```bash
rm scripts/generate-assets.mjs
pnpm remove -Dw playwright
```

- [ ] **Step 3: Remove old og-default.jpg**

```bash
rm apps/web/public/og-default.jpg
```

- [ ] **Step 4: Full build verification**

Run:
```bash
pnpm build
```

Expected: Clean build with no errors. No references to `og-default.jpg` remaining.

Check for stale references:
```bash
grep -r "og-default" apps/web/src/
```

Expected: No matches (the BaseHead.astro update in Task 6 already removed the reference).

- [ ] **Step 5: Preview and spot-check**

Run:
```bash
pnpm -F @jasonmatthew/web preview
```

Open the site in a browser. Use browser dev tools to inspect the `<meta property="og:image">` tag on:
- Homepage → should point to `/og/default.png`
- A blog post → should point to `/og/blog/<slug>.png`
- A project → should point to `/og/projects/<slug>.png`

- [ ] **Step 6: Commit all generated images and cleanup**

```bash
git add apps/web/public/og/
git add apps/web/public/favicon-512.png apps/web/public/apple-touch-icon.png apps/web/public/favicon.svg
git rm scripts/generate-assets.mjs
git rm apps/web/public/og-default.jpg
git add package.json pnpm-lock.yaml
git commit -m "feat: generate all OG images, remove Playwright and old assets"
```
