#!/usr/bin/env node
// WCAG contrast gate for the single coral accent.
//
// Coral carries body-link text, nav labels, numeric markers, and section labels,
// so it must clear WCAG AA (4.5:1) for normal text against paper in BOTH themes —
// not merely the 3:1 non-text threshold. This script parses the coral + paper
// tokens straight out of global.css (the single source of truth) and fails the
// build if either pairing regresses, so a token edit can't silently ship an
// inaccessible accent.
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

const pairs = [
  { theme: 'light', coral: readToken(lightBody, 'coral'), paper: readToken(lightBody, 'paper') },
  { theme: 'dark', coral: readToken(darkBody, 'coral'), paper: readToken(darkBody, 'paper') },
];

let failed = false;
for (const { theme, coral, paper } of pairs) {
  if (!coral || !paper) {
    console.error(`✗ contrast: could not read --coral/--paper for ${theme} from ${CSS_PATH}`);
    failed = true;
    continue;
  }
  const ratio = contrastRatio(coral, paper);
  const ok = ratio >= THRESHOLD;
  const line = `${ok ? '✓' : '✗'} contrast ${theme}: coral ${coral} on paper ${paper} = ${ratio.toFixed(2)}:1 (need ≥ ${THRESHOLD}:1)`;
  if (ok) console.log(line);
  else {
    console.error(line);
    failed = true;
  }
}

if (failed) {
  console.error('\nContrast gate failed — coral must clear WCAG AA on paper in both themes.');
  process.exit(1);
}
console.log('Contrast gate passed.');
