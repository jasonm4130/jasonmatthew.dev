#!/usr/bin/env node
// Render mermaid .mmd source files to themed SVGs.
// Outputs go to apps/web/public/diagrams/. Hardcoded sentinel colors from
// scripts/diagrams/mermaid.config.json are swapped for CSS variables so the
// SVGs respond to the site's light/dark theme without re-rendering.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(__dirname, 'diagrams');
const OUT_DIR = join(ROOT, 'apps', 'web', 'src', 'diagrams');
const CONFIG_PATH = join(SRC_DIR, 'mermaid.config.json');

const SWAPS = [
  [/#fafafa/gi, 'var(--color-bg)'],
  [/#111111/gi, 'var(--color-fg)'],
  [/#e8553d/gi, 'var(--color-accent)'],
  [/#888888/gi, 'var(--color-muted, #888)'],
  // Mermaid derives a near-black for arrowhead fills from lineColor.
  [/#050505/gi, 'var(--color-fg)'],
  // Mermaid emits the configured fg as rgb() for some text fills.
  [/rgb\(17,\s*17,\s*17\)/g, 'var(--color-fg)'],
  // Edge label backgrounds use the bg color with alpha; CSS vars do not
  // alpha-mix cleanly, so drop the alpha and use the solid theme bg.
  [/rgba\(250,\s*250,\s*250[^)]*\)/g, 'var(--color-bg)'],
  [/background-color:\s*white;?/g, ''],
];

async function render(file) {
  const inPath = join(SRC_DIR, file);
  const outName = basename(file, '.mmd') + '.svg';
  const outPath = join(OUT_DIR, outName);

  await execFileAsync('pnpm', ['exec', 'mmdc', '-i', inPath, '-o', outPath, '-c', CONFIG_PATH, '-b', 'transparent'], {
    cwd: ROOT,
  });

  let svg = await readFile(outPath, 'utf8');
  for (const [pattern, replacement] of SWAPS) {
    svg = svg.replace(pattern, replacement);
  }
  await writeFile(outPath, svg);
  console.log(`rendered ${file} -> src/diagrams/${outName}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.mmd'));
  if (files.length === 0) {
    console.log('no .mmd files found in scripts/diagrams/');
    return;
  }
  for (const file of files) {
    await render(file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
