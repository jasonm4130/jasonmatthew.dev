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
      <div style="display:flex;position:absolute;top:0;left:0;right:0;height:6px;background:#e8553d;"></div>
      <div style="display:flex;flex:1;flex-direction:column;justify-content:center;align-items:center;">
        <div style="display:flex;color:#f0f0f0;font-size:64px;font-weight:700;">Jason Matthew</div>
        <div style="display:flex;color:#f0f0f0;opacity:0.5;font-size:24px;margin-top:20px;">
          Engineering Manager &amp; Builder
        </div>
      </div>
      <div style="display:flex;justify-content:center;">
        <span style="color:#e8553d;font-size:18px;letter-spacing:2px;">JASONMATTHEW.DEV</span>
      </div>
    </div>
  `;
}
