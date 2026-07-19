#!/usr/bin/env node
// WCAG contrast gate for the notebook text tokens.
//
// The secondary-text tokens (the coral accent, muted, faint) all carry real body
// text — links, nav/section labels, numeric markers, dates, meta, descriptions,
// footer — so each must clear WCAG AA (4.5:1) for normal text against every surface
// it sits on (paper AND the card/callout surface), in BOTH themes — not merely the
// 3:1 non-text threshold. This script parses those tokens straight out of global.css
// (the single source of truth) and fails the build if any pairing regresses, so a
// token edit can't silently ship inaccessible text.
//
// Dependency-free (no runner needed). Wired into apps/web's `build` and `deploy`
// scripts via `node ../../scripts/check-contrast.mjs &&`, and resolves the CSS
// relative to itself so cwd doesn't matter.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CSS_PATH = fileURLToPath(new URL('../apps/web/src/styles/global.css', import.meta.url));
const THRESHOLD = 4.5; // WCAG 2.1 AA, normal-size text

/** Return the `{ … }` body for the first rule whose selector matches `selectorRe`. */
function ruleBody(css, selectorRe) {
  const at = css.search(selectorRe);
  if (at === -1) return null;
  const open = css.indexOf('{', at);
  const close = css.indexOf('}', open); // token blocks have no nested braces
  if (open === -1 || close === -1) return null;
  return css.slice(open + 1, close);
}

/** Read a `--name: <value>;` declaration out of a rule body. */
function readToken(body, name) {
  const m = body && body.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`not a hex colour: "${hex}"`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const css = readFileSync(CSS_PATH, 'utf8');

// Light palette lives on the bare `:root {` rule; dark on `:root[data-theme='dark']`.
const lightBody = ruleBody(css, /:root\s*\{/);
const darkBody = ruleBody(css, /:root\[data-theme=['"]dark['"]\]\s*\{/);

const themes = [
  { theme: 'light', body: lightBody },
  { theme: 'dark', body: darkBody },
];
// Foreground text tokens that must stay legible, and the backgrounds they render on.
const TEXT_TOKENS = ['coral', 'muted', 'faint'];
const BG_TOKENS = ['paper', 'surface'];

let failed = false;
for (const { theme, body } of themes) {
  for (const fg of TEXT_TOKENS) {
    const fgVal = readToken(body, fg);
    for (const bg of BG_TOKENS) {
      const bgVal = readToken(body, bg);
      if (!fgVal || !bgVal) {
        console.error(`✗ contrast: could not read --${fg}/--${bg} for ${theme} from ${CSS_PATH}`);
        failed = true;
        continue;
      }
      const ratio = contrastRatio(fgVal, bgVal);
      const ok = ratio >= THRESHOLD;
      const line = `${ok ? '✓' : '✗'} contrast ${theme}: ${fg} ${fgVal} on ${bg} ${bgVal} = ${ratio.toFixed(2)}:1 (need ≥ ${THRESHOLD}:1)`;
      if (ok) console.log(line);
      else {
        console.error(line);
        failed = true;
      }
    }
  }
}

if (failed) {
  console.error('\nContrast gate failed — coral/muted/faint must clear WCAG AA on paper and surface in both themes.');
  process.exit(1);
}
console.log('Contrast gate passed.');
