// scripts/og-templates/notebook.mjs
// Shared design tokens + helpers for the OG/favicon Satori templates, mirroring the
// notebook design system (apps/web/src/styles/global.css, light/paper theme).

export const PALETTE = {
  paper: '#f4efe4',
  ink: '#100d06',
  coral: '#b83c1c',
  muted: '#635e54',
  faint: '#6d6557',
  border: '#e4ded0',
  surface: '#ece5d6',
  body2: '#332e25',
};

// Zero-width space. satori-html does NOT decode HTML entities (`&amp;`/`&lt;` render as
// literal text), so we can't escape via entities.
const ZWSP = String.fromCharCode(0x200b);

// `&` and `>` are safe raw in satori-html; only a `<` that forms a tag (`<Component>`)
// corrupts the parsed tree. Inserting a ZWSP after each angle bracket blocks tag
// parsing (invisible in the render) so arbitrary title/description text stays one node.
export function esc(str) {
  return String(str ?? '')
    .replace(/</g, '<' + ZWSP)
    .replace(/>/g, ZWSP + '>');
}

// Article kind → uppercase kicker label (mirrors apps/web/src/data/kinds.ts, uppercased
// for the OG kicker). Unknown/empty falls back to the essay default.
const KIND_LABELS = {
  essay: 'ESSAY',
  buildlog: 'BUILD-LOG',
  incident: 'INCIDENT',
  architecture: 'ARCHITECTURE',
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] ?? KIND_LABELS.essay;
}
