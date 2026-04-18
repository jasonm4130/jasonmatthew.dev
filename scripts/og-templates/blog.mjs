// scripts/og-templates/blog.mjs
import { html } from 'satori-html';

/**
 * @param {{ title: string, date: string, tags: string[] }} data
 */
export function blogTemplate({ title, date, tags }) {
  const tagPills = tags
    .slice(0, 4)
    .map(
      (tag) =>
        `<span style="background:#1e1e1e;color:#e8553d;padding:6px 16px;border-radius:6px;font-size:16px;">${tag}</span>`,
    )
    .join('');

  const markup = `
    <div style="display:flex;flex-direction:column;width:100%;height:100%;background:#121212;padding:48px;font-family:Sora;">
      <div style="display:flex;position:absolute;top:0;left:0;right:0;height:6px;background:#e8553d;"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#f0f0f0;font-size:18px;opacity:0.6;letter-spacing:2px;">JASONMATTHEW.DEV</span>
        <span style="color:#e8553d;font-size:18px;">Blog</span>
      </div>
      <div style="display:flex;flex:1;flex-direction:column;justify-content:center;">
        <div style="display:flex;color:#f0f0f0;font-size:48px;font-weight:700;line-height:1.2;">${title}</div>
        <div style="display:flex;color:#f0f0f0;opacity:0.5;font-size:20px;margin-top:16px;">${date}</div>
      </div>
      <div style="display:flex;gap:12px;">${tagPills}</div>
    </div>
  `;
  return html(markup);
}
