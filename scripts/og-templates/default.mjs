// scripts/og-templates/default.mjs
import { html } from 'satori-html';
import { PALETTE } from './notebook.mjs';

/**
 * Default OG card — homepage / static pages. The "Jason Matthew." wordmark (serif +
 * coral dot, echoing the nav brand) over the site's builder-writer line.
 */
export function defaultTemplate() {
  const { paper, ink, coral, muted } = PALETTE;
  const markup = `
    <div style="display:flex;flex-direction:column;width:100%;height:100%;background:${paper};padding:66px 72px;font-family:'Libre Baskerville';position:relative;">
      <div style="display:flex;position:absolute;top:0;left:0;right:0;height:8px;background:${coral};"></div>
      <div style="display:flex;flex:1;flex-direction:column;justify-content:center;align-items:flex-start;">
        <div style="display:flex;color:${coral};font-family:'Monaspace Neon';font-size:20px;letter-spacing:3px;margin-bottom:26px;">AI-NATIVE BUILDER & WRITER</div>
        <div style="display:flex;color:${ink};font-size:82px;font-weight:700;line-height:1.1;">Jason Matthew<span style="color:${coral};">.</span></div>
        <div style="display:flex;color:${muted};font-size:30px;line-height:1.4;margin-top:26px;max-width:820px;">I build production AI systems and write about the engineering underneath the hype.</div>
      </div>
      <div style="display:flex;justify-content:flex-start;font-family:'Monaspace Neon';">
        <span style="color:${coral};font-size:19px;letter-spacing:2px;">JASONMATTHEW.DEV</span>
      </div>
    </div>
  `;
  return html(markup);
}
