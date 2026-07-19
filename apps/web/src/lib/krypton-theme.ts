// The warm "Krypton" code theme — the single source for article/project syntax
// colours (Expressive Code bakes these into per-theme CSS at build; global.css does
// NOT duplicate them). A deliberate single-family palette from the design study:
// coral leads, with amber (function), gold (type), moss (string) and a warm number
// hue supporting it — no cold blues, no purple. Set in Monaspace Krypton (loaded via
// the Astro Fonts API, wired through `--font-mono-code`).
//
// Named 'light' / 'dark' on purpose: astro.config's `themeCssSelector` turns the name
// into `:root[data-theme='<name>']`, so these switch in lockstep with the notebook
// tri-state in global.css (explicit choice), while `useDarkModeMediaQuery` covers the
// system-dark-no-choice case. Values mirror the specimen `Code Theme - Krypton.dc.html`.
import { ExpressiveCodeTheme } from 'astro-expressive-code';

interface KryptonPalette {
  bg: string;
  fg: string;
  comment: string;
  keyword: string;
  string: string;
  func: string;
  type: string;
  number: string;
}

const LIGHT: KryptonPalette = {
  bg: '#ece6d9',
  fg: '#2a251c',
  comment: '#9c9078',
  keyword: '#c14a28',
  string: '#5f6b33',
  func: '#b05f24',
  type: '#8a6a12',
  number: '#a6552f',
};

const DARK: KryptonPalette = {
  bg: '#12100b',
  fg: '#d7d0c1',
  comment: '#7d7565',
  keyword: '#ef6b4c',
  string: '#a8b268',
  func: '#e2965d',
  type: '#d9b65f',
  number: '#e79070',
};

function kryptonTheme(name: 'light' | 'dark', c: KryptonPalette): ExpressiveCodeTheme {
  return new ExpressiveCodeTheme({
    name,
    type: name,
    colors: {
      'editor.background': c.bg,
      'editor.foreground': c.fg,
    },
    settings: [
      {
        scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
        settings: { foreground: c.comment, fontStyle: 'italic' },
      },
      {
        scope: [
          'keyword',
          'storage',
          'storage.type',
          'storage.modifier',
          'keyword.control',
          'keyword.operator.new',
          'keyword.operator.expression',
          'variable.language',
          'entity.name.tag',
          'punctuation.definition.keyword',
        ],
        settings: { foreground: c.keyword },
      },
      {
        scope: [
          'string',
          'string.quoted',
          'string.template',
          'punctuation.definition.string',
          'constant.other.symbol',
          'meta.attribute-selector',
        ],
        settings: { foreground: c.string },
      },
      {
        scope: [
          'entity.name.function',
          'support.function',
          'meta.function-call',
          'meta.function-call.generic',
          'variable.function',
        ],
        settings: { foreground: c.func },
      },
      {
        scope: [
          'entity.name.type',
          'entity.name.class',
          'support.type',
          'support.class',
          'entity.other.inherited-class',
          'entity.name.namespace',
          'storage.type.class',
        ],
        settings: { foreground: c.type },
      },
      {
        scope: [
          'constant.numeric',
          'constant.language',
          'constant.character',
          'constant',
          'support.constant',
          'keyword.other.unit',
        ],
        settings: { foreground: c.number },
      },
    ],
  });
}

export const kryptonLight = kryptonTheme('light', LIGHT);
export const kryptonDark = kryptonTheme('dark', DARK);
export const kryptonThemes = [kryptonLight, kryptonDark];
