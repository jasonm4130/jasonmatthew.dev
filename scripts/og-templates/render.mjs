// scripts/og-templates/render.mjs
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';

const soraRegular = readFileSync(new URL('./fonts/Sora-Regular.ttf', import.meta.url));
const soraBold = readFileSync(new URL('./fonts/Sora-Bold.ttf', import.meta.url));

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
