// scripts/og-templates/project.mjs
import { html } from 'satori-html';
import { PALETTE, esc } from './notebook.mjs';

/**
 * Project OG card — notebook voice, aligned with the article card: paper ground,
 * coral hairline, "WORK" kicker, serif title + description, technologies as mono chips.
 *
 * @param {{ title: string, description: string, technologies: string[] }} data
 */
export function projectTemplate({ title, description, technologies }) {
  const { paper, ink, coral, muted, faint, border } = PALETTE;
  const techChips = (technologies || [])
    .slice(0, 4)
    .map(
      (t) =>
        `<span style="display:flex;font-family:'Monaspace Neon';font-size:17px;color:${muted};border:1px solid ${border};padding:7px 15px;border-radius:3px;">${esc(t)}</span>`,
    )
    .join('');
  const markup = `
    <div style="display:flex;flex-direction:column;width:100%;height:100%;background:${paper};padding:66px 72px;font-family:'Libre Baskerville';position:relative;">
      <div style="display:flex;position:absolute;top:0;left:0;right:0;height:8px;background:${coral};"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-family:'Monaspace Neon';font-size:19px;letter-spacing:2px;">
        <span style="color:${muted};">JASONMATTHEW.DEV</span>
        <span style="color:${coral};">WORK</span>
      </div>
      <div style="display:flex;flex:1;flex-direction:column;justify-content:center;">
        <div style="display:flex;color:${ink};font-size:54px;font-weight:700;line-height:1.16;">${esc(title)}</div>
        <div style="display:flex;color:${muted};font-size:26px;line-height:1.5;margin-top:22px;max-width:960px;">${esc(description)}</div>
      </div>
      <div style="display:flex;gap:12px;">${techChips}</div>
    </div>
  `;
  return html(markup);
}
