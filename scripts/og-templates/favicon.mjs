// scripts/og-templates/favicon.mjs
import { html } from 'satori-html';
import { PALETTE } from './notebook.mjs';

// "JM." monogram — the "Jason Matthew." wordmark distilled: ink on paper with the
// coral dot. Sora Bold (the brand's sans wordmark face), legible down to 16px.

/**
 * Raster favicon (favicon-512.png, apple-touch-icon.png). Rendered via Satori.
 */
export function faviconTemplate() {
  const { paper, ink, coral } = PALETTE;
  return html`
    <div
      style="display:flex;width:100%;height:100%;background:${paper};align-items:center;justify-content:center;border-radius:22%;font-family:'Sora';"
    >
      <span style="display:flex;color:${ink};font-size:250px;font-weight:700;letter-spacing:-8px;"
        >JM<span style="color:${coral};">.</span></span
      >
    </div>
  `;
}

/**
 * Adaptive favicon.svg — same "JM." mark, colours flip with prefers-color-scheme.
 * Hand-written (not Satori) so the media query survives; text uses a system sans
 * fallback since favicon SVGs don't load @font-face faces.
 */
export function faviconSvgContent() {
  const { paper, ink, coral } = PALETTE;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <style>
    .bg { fill: ${paper}; }
    .fg { fill: ${ink}; }
    .dot { fill: ${coral}; }
    @media (prefers-color-scheme: dark) {
      .bg { fill: ${ink}; }
      .fg { fill: ${paper}; }
    }
  </style>
  <rect class="bg" width="512" height="512" rx="110" ry="110"/>
  <text class="fg" x="248" y="256" text-anchor="middle" dominant-baseline="central"
        font-family="'Sora', 'Helvetica Neue', Arial, sans-serif" font-weight="700"
        font-size="250" letter-spacing="-8">JM<tspan class="dot">.</tspan></text>
</svg>`;
}
