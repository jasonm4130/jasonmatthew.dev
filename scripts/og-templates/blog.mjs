// scripts/og-templates/blog.mjs
import { html } from 'satori-html';
import { PALETTE, esc, kindLabel } from './notebook.mjs';

/**
 * Article OG card — notebook voice: paper ground, a coral hairline, a mono kicker
 * (kind), a Libre Baskerville serif title, and a mono date. Mirrors the article
 * reading-template header.
 *
 * @param {{ title: string, date: string, kind?: string }} data
 */
export function blogTemplate({ title, date, kind }) {
  const { paper, ink, coral, muted } = PALETTE;
  const markup = `
    <div style="display:flex;flex-direction:column;width:100%;height:100%;background:${paper};padding:66px 72px;font-family:'Libre Baskerville';position:relative;">
      <div style="display:flex;position:absolute;top:0;left:0;right:0;height:8px;background:${coral};"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-family:'Monaspace Neon';font-size:19px;letter-spacing:2px;">
        <span style="color:${muted};">JASONMATTHEW.DEV</span>
        <span style="color:${coral};">WRITING</span>
      </div>
      <div style="display:flex;flex:1;flex-direction:column;justify-content:center;">
        <div style="display:flex;color:${coral};font-family:'Monaspace Neon';font-size:20px;letter-spacing:3px;margin-bottom:22px;">${esc(kindLabel(kind))}</div>
        <div style="display:flex;color:${ink};font-size:54px;font-weight:700;line-height:1.18;">${esc(title)}</div>
        <div style="display:flex;color:${muted};font-family:'Monaspace Neon';font-size:22px;margin-top:26px;">${esc(date)}</div>
      </div>
    </div>
  `;
  return html(markup);
}
