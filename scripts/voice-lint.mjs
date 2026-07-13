#!/usr/bin/env node
// Deterministic tier-1 voice lint for public-facing text.
// House rules sourced from the vault voice corpus (CLAUDE.md §On voice,
// LinkedIn Strategy SOP, Public Narrative tone checklist) and the repo's own
// correction history (commit f3077e7: em-dashes 180→6, "genuinely" 15→0).
// Tier 2 (judgment calls) lives in .claude/skills/voice-check/SKILL.md.
//
// Usage: node scripts/voice-lint.mjs [--social] [--platform x|linkedin] <file...>
//        cat draft.md | node scripts/voice-lint.mjs --social --platform x
// Exit 1 when any BLOCK finding exists; warnings alone exit 0.

import { readFileSync } from 'node:fs';

const BANNED_WORDS = [
  // vault CLAUDE.md §On voice + PN drafts voice check + Strategy SOP guardrails
  'delve',
  'delves',
  'delved',
  'delving',
  'leverage',
  'leverages',
  'leveraged',
  'leveraging',
  'foster',
  'fosters',
  'fostering',
  'holistic',
  'seamless',
  'seamlessly',
  'unlock',
  'unlocks',
  'unlocking',
  'comprehensive',
  'pivotal',
  'empower',
  'empowers',
  'empowering',
  'tapestry',
  'game-changer',
  'game-changing',
  'paradigm shift',
  'genuinely',
  'elevate',
  'elevates',
  'elevating',
  'meticulous',
  'meticulously',
  'testament',
  'showcase',
  'showcases',
  'showcasing',
  'boast',
  'boasts',
  'boasting',
  'intricate',
  'intricacies',
  'robust',
  'robustly',
];

const MARKETING_AI = [
  'ai-powered',
  'llm-enabled',
  'ai-first',
  'cutting-edge',
  'state-of-the-art',
  'best-in-class',
  'world-class',
];

// Legitimate in technical prose (the published anchors use them) but worth a
// conscious look — warn, don't block.
const TECH_CLICHE = ['production-grade', 'battle-tested', 'enterprise-grade'];

const SYCOPHANCY = [
  'great question',
  'great post',
  'hope you’re doing well',
  "hope you're doing well",
  'i hope this helps',
  'certainly!',
  'absolutely!',
  'would love to chat',
  'what an achievement',
  "in this post we'll explore",
  "let's dive in",
  'let us dive in',
];

const ENGAGEMENT_BAIT = [
  'thoughts?',
  'agree or disagree',
  "what's your experience",
  'what do you think?',
  'let me know in the comments',
  'drop a comment',
  'sound off below',
];

const INFLUENCER_FLUFF = [
  'thrilled to announce',
  'excited to announce',
  'pleased to announce',
  'excited to share',
  'proud to announce',
  'proud to share',
  "in today's fast-paced",
  'in today’s fast-paced',
  'in the ever-evolving',
  'in the rapidly evolving',
  'game changer',
];

const NEG_PARALLELISM = [
  /it['’]?s not (?:about )?[^.;\n]{2,60}?[,—;-]\s*it['’]?s\b/i,
  /isn['’]?t\s+[^.;\n]{2,60}?[,—;-]\s*it['’]?s\b/i,
  /\bnot (?:just|only|merely)\b[^.;\n]{2,80}?\bbut(?: also)?\b/i,
  /\bthat['’]?s not\b[^.!?\n]{0,60}[.!?]\s*that['’]?s\b/i,
];

const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
const URL_RE = /https?:\/\/\S+/g;

export function xWeightedLength(text) {
  const urls = text.match(URL_RE)?.length ?? 0;
  return [...text.replace(URL_RE, '')].length + urls * 23;
}

// Strip regions where prose rules must not reach: frontmatter, fenced code,
// inline code, URLs, import lines. Replaced with spaces to keep line numbers.
function maskNonProse(text) {
  let masked = text;
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  masked = masked.replace(/^---\n[\s\S]*?\n---\n/, blank); // frontmatter
  masked = masked.replace(/```[\s\S]*?```/g, blank); // fenced code
  masked = masked.replace(/`[^`\n]*`/g, blank); // inline code
  masked = masked.replace(URL_RE, blank); // URLs
  masked = masked.replace(/^import .*$/gm, blank); // MDX imports
  masked = masked.replace(/^(?=.*-)(?=.*\|)[\s|:-]+$/gm, blank); // table divider rows
  return masked;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function findAll(masked, patterns, rule, severity, findings) {
  for (const raw of patterns) {
    const re =
      raw instanceof RegExp
        ? new RegExp(raw.source, raw.flags.includes('g') ? raw.flags : raw.flags + 'g')
        : new RegExp(`\\b${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    for (const m of masked.matchAll(re)) {
      findings.push({ rule, severity, line: lineOf(masked, m.index), match: m[0].trim() });
    }
  }
}

export function lintText(text, opts = {}) {
  const findings = [];
  const masked = maskNonProse(text);

  // BLOCK tier — house hard rules
  for (const m of masked.matchAll(/—/g)) {
    findings.push({ rule: 'em-dash', severity: 'block', line: lineOf(masked, m.index), match: '—' });
  }
  findAll(masked, BANNED_WORDS, 'banned-word', 'block', findings);
  findAll(masked, [/\bharness(?:es|ed|ing)?\s+the\b/i], 'harness-as-verb', 'block', findings);
  findAll(
    masked,
    MARKETING_AI.map((w) => new RegExp(w.replace(/-/g, '[- ]'), 'i')),
    'marketing-ai',
    'block',
    findings,
  );
  findAll(masked, SYCOPHANCY, 'sycophancy', 'block', findings);
  findAll(masked, ENGAGEMENT_BAIT, 'engagement-bait', 'block', findings);
  findAll(masked, INFLUENCER_FLUFF, 'influencer-fluff', 'block', findings);

  if (opts.social) {
    for (const m of masked.matchAll(/(^|\s)#[a-z0-9_]+/gi)) {
      findings.push({ rule: 'hashtag', severity: 'block', line: lineOf(masked, m.index), match: m[0].trim() });
    }
    const emoji = masked.match(EMOJI_RE);
    if (emoji)
      findings.push({
        rule: 'emoji',
        severity: 'block',
        line: lineOf(masked, masked.indexOf(emoji[0])),
        match: emoji[0],
      });
    if (opts.platform === 'x') {
      const len = xWeightedLength(text.trim());
      if (len > 280)
        findings.push({
          rule: 'x-length',
          severity: 'block',
          line: 1,
          match: `${len} weighted chars (limit 280, URLs count 23)`,
        });
    }
  }

  // WARN tier — constructions and statistics
  findAll(
    masked,
    TECH_CLICHE.map((w) => new RegExp(w.replace(/-/g, '[- ]'), 'i')),
    'tech-cliche',
    'warn',
    findings,
  );
  findAll(masked, NEG_PARALLELISM, 'negative-parallelism', 'warn', findings);
  findAll(
    masked,
    [/^additionally,/im, /\bon the one hand\b/i, /it is (?:also )?important to (?:note|consider|mention)/i],
    'both-sides-hedge',
    'warn',
    findings,
  );
  findAll(
    masked,
    [/,\s+(?!during|according)[a-z]+ing\s+(?:its|their|the|his|her|a|an)\b/g],
    'participial-clause',
    'warn',
    findings,
  );
  findAll(masked, [/^(?:overall|in conclusion|in summary),/im], 'recap-closer', 'warn', findings);
  findAll(masked, [/--/], 'double-hyphen', 'warn', findings);

  // Burstiness: sentence-length variation. Humans ~0.6-1.2 std/mean; LLM 0.2-0.4.
  const sentences = masked
    .replace(/\s+/g, ' ')
    .split(/[.!?]+\s/)
    .map((s) => s.trim().split(/\s+/).filter(Boolean).length)
    .filter((n) => n > 2);
  if (sentences.length >= 8) {
    const mean = sentences.reduce((a, b) => a + b, 0) / sentences.length;
    const std = Math.sqrt(sentences.reduce((a, b) => a + (b - mean) ** 2, 0) / sentences.length);
    if (std / mean < 0.4) {
      findings.push({
        rule: 'low-burstiness',
        severity: 'warn',
        line: 1,
        match: `sentence-length std/mean ${(std / mean).toFixed(2)} (<0.40; human prose is usually >0.6)`,
      });
    }
  }

  return findings;
}

function main() {
  const args = process.argv.slice(2);
  const opts = { social: args.includes('--social') };
  const platIdx = args.indexOf('--platform');
  if (platIdx !== -1) opts.platform = args[platIdx + 1];
  const files = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--platform');

  const inputs = files.length ? files.map((f) => [f, readFileSync(f, 'utf8')]) : [['<stdin>', readFileSync(0, 'utf8')]];

  let blocks = 0;
  for (const [name, text] of inputs) {
    const findings = lintText(text, opts);
    for (const f of findings) {
      if (f.severity === 'block') blocks++;
      console.log(`${f.severity.toUpperCase().padEnd(5)} ${name}:${f.line} [${f.rule}] ${f.match}`);
    }
    if (findings.length === 0) console.log(`OK    ${name} — no findings`);
  }
  process.exit(blocks > 0 ? 1 : 0);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  main();
}
