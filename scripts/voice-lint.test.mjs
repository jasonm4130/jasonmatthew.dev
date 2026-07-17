import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintText, xWeightedLength } from './voice-lint.mjs';

const block = (findings) => findings.filter((f) => f.severity === 'block');
const warn = (findings) => findings.filter((f) => f.severity === 'warn');
const rules = (findings) => findings.map((f) => f.rule);

test('em-dash in prose is a block finding', () => {
  const f = lintText('The MVP took a day — the hardening took weeks.');
  assert.ok(rules(block(f)).includes('em-dash'));
});

test('em-dash inside fenced code blocks is exempt', () => {
  const f = lintText('Some prose.\n\n```js\nconst a = "x — y";\n```\n\nMore prose.');
  assert.ok(!rules(f).includes('em-dash'));
});

test('em-dash inside inline code is exempt', () => {
  const f = lintText('Run `foo — bar` to see it.');
  assert.ok(!rules(f).includes('em-dash'));
});

test('em-dash and banned words inside ~~~ fenced code are exempt', () => {
  const f = lintText('Some prose.\n\n~~~js\nconst a = "x — y"; // leverage\n~~~\n\nMore prose.');
  assert.ok(!rules(f).includes('em-dash'), JSON.stringify(f));
  assert.ok(!rules(f).includes('banned-word'), JSON.stringify(f));
});

test('CRLF frontmatter is masked (its content is not linted)', () => {
  const f = lintText('---\r\ntitle: A — B\r\nexcerpt: hi\r\n---\r\n\r\nClean prose.\r\n');
  assert.ok(!rules(f).includes('em-dash'), JSON.stringify(f));
  assert.ok(!rules(f).includes('double-hyphen'), JSON.stringify(f));
});

test('banned lexicon: genuinely, delve, leverage, tapestry', () => {
  const f = lintText('I genuinely wanted to delve into the tapestry and leverage it.');
  const found = block(f)
    .filter((x) => x.rule === 'banned-word')
    .map((x) => x.match.toLowerCase());
  assert.ok(found.includes('genuinely'));
  assert.ok(found.includes('delve'));
  assert.ok(found.includes('leverage'));
  assert.ok(found.includes('tapestry'));
});

test('harness as engineering noun is fine; "harness the" is flagged', () => {
  const ok = lintText('The eval harness runs on every change.');
  assert.ok(!rules(ok).includes('banned-word'));
  const bad = lintText('We harness the power of AI.');
  assert.ok(rules(bad).includes('harness-as-verb'));
});

test('marketing-AI adjectives are blocked', () => {
  const f = lintText('A cutting-edge, AI-powered, best-in-class platform.');
  assert.ok(block(f).filter((x) => x.rule === 'marketing-ai').length >= 3);
});

test('negative parallelism variants are warned', () => {
  const samples = [
    "It's not about the speed of the build — it's about trust.",
    "An eval you don't run isn't an eval — it's a museum piece.",
    "That's not senior. That's experienced mid-level.",
    'This is not just a tool but also a philosophy.',
  ];
  for (const s of samples) {
    const f = lintText(s);
    assert.ok(rules(f).includes('negative-parallelism'), `missed: ${s}`);
  }
});

test('engagement-bait closers and sycophancy openers are blocked', () => {
  const f = lintText("Great question! Here is my take.\n\nWhat's your experience? Let me know in the comments.");
  assert.ok(rules(block(f)).includes('sycophancy'));
  assert.ok(rules(block(f)).includes('engagement-bait'));
});

test('linkedin-influencer fluff is blocked', () => {
  const f = lintText("Thrilled to announce that in today's fast-paced world I shipped a thing.");
  assert.ok(block(f).filter((x) => x.rule === 'influencer-fluff').length >= 2);
});

test('social mode: hashtags and emoji are blocked', () => {
  const f = lintText('Shipping day 🚀 #buildinpublic #ai', { social: true });
  assert.ok(rules(block(f)).includes('hashtag'));
  assert.ok(rules(block(f)).includes('emoji'));
});

test('blog mode: hashtags in prose are not flagged (markdown headings use #)', () => {
  const f = lintText('## A heading\n\nSome prose.');
  assert.ok(!rules(f).includes('hashtag'));
});

test('trailing present-participial clause is warned', () => {
  const f = lintText('The counter increments before the call, highlighting its importance to the budget.');
  assert.ok(rules(warn(f)).includes('participial-clause'));
});

test('low sentence-length variance is warned on longer texts', () => {
  const uniform = Array(12).fill('This sentence contains exactly eight words in total.').join(' ');
  const f = lintText(uniform);
  assert.ok(rules(warn(f)).includes('low-burstiness'));
});

test('house-voice sample passes clean', () => {
  const sample = [
    'Every board game night has the same argument. Someone plays a card, someone else says "you cannot do that", and the rulebook comes out.',
    'Twenty minutes later you have found the paragraph. Half the table has lost interest.',
    'The fix: retrieval. Get the right passage in front of the model so the answer is grounded in the book.',
    'It took one Sunday. 283 tests today.',
  ].join('\n\n');
  const f = lintText(sample);
  assert.equal(block(f).length, 0, JSON.stringify(f, null, 1));
});

test('markdown table divider rows are exempt from double-hyphen', () => {
  const f = lintText('| Zone | What |\n| ---- | ---- |\n| 1    | RAG  |\n');
  assert.ok(!rules(f).includes('double-hyphen'), JSON.stringify(f));
});

test('production-grade in technical prose is a warn, not a block', () => {
  const f = lintText('Production-grade zone 4 is a multi-year horizon.');
  const hit = f.find((x) => x.rule === 'tech-cliche');
  assert.ok(hit, 'expected a tech-cliche finding');
  assert.equal(hit.severity, 'warn');
  assert.ok(!block(f).length, 'must not block');
});

test('xWeightedLength counts URLs as 23', () => {
  assert.equal(xWeightedLength('see https://example.com/very/long/path now'), 4 + 23 + 4);
});

test('social x mode: over-280-weighted is blocked', () => {
  const f = lintText('a'.repeat(281), { social: true, platform: 'x' });
  assert.ok(rules(block(f)).includes('x-length'));
});
