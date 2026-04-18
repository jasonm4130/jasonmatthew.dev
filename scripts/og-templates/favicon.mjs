// scripts/og-templates/favicon.mjs
import { html } from 'satori-html';
import { readFileSync } from 'node:fs';

const lettermarkSvg = readFileSync(new URL('../../apps/web/public/jm-lettermark.svg', import.meta.url), 'utf-8');
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
