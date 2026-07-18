import { describe, it, expect } from 'vitest';
import remarkSidenotes from '../src/plugins/remark-sidenotes.mjs';
import remarkCallouts from '../src/plugins/remark-callouts.mjs';

// The transforms are pure mdast → mdast, so we hand-build the tree the way the GFM /
// directive parsers would emit it (same style as content-graph.test.ts building
// GraphEntry objects) and assert on the transformed tree — no full parse pipeline.

function text(value: string) {
  return { type: 'text', value };
}
function paragraph(children: unknown[], data?: unknown) {
  return { type: 'paragraph', children, ...(data ? { data } : {}) };
}

/** Collect every node in the tree matching a predicate (depth-first). */
function collect(node: any, pred: (n: any) => boolean, out: any[] = []): any[] {
  if (pred(node)) out.push(node);
  if (Array.isArray(node.children)) for (const c of node.children) collect(c, pred, out);
  return out;
}
const byHName = (name: string) => (n: any) => n?.data?.hName === name;
const hasClass = (n: any, cls: string) =>
  Array.isArray(n?.data?.hProperties?.className) && n.data.hProperties.className.includes(cls);

describe('remark-sidenotes', () => {
  function fixture() {
    return {
      type: 'root',
      children: [
        paragraph([
          text('See this'),
          { type: 'footnoteReference', identifier: '1', label: '1' },
          text(' and that'),
          { type: 'footnoteReference', identifier: 'note-b', label: 'note-b' },
        ]),
        {
          type: 'footnoteDefinition',
          identifier: '1',
          label: '1',
          children: [paragraph([text('First note')])],
        },
        {
          type: 'footnoteDefinition',
          identifier: 'note-b',
          label: 'note-b',
          children: [paragraph([text('Second '), { type: 'emphasis', children: [text('note')] }])],
        },
      ],
    };
  }

  it('inlines footnote definitions as gutter sidenotes and removes the bottom section', () => {
    const tree = fixture();
    remarkSidenotes()(tree as any);

    // No GFM footnote nodes survive → mdast-util-to-hast generates no "Footnotes" section.
    expect(collect(tree, (n) => n.type === 'footnoteReference')).toHaveLength(0);
    expect(collect(tree, (n) => n.type === 'footnoteDefinition')).toHaveLength(0);
    // The two definitions are gone from the root — inlined at their reference sites.
    expect((tree.children as any[]).every((c) => c.type === 'paragraph')).toBe(true);
  });

  it('emits a <sup class="sn-ref"> + <span class="sidenote"> pair per reference, renumbered 1..n', () => {
    const tree = fixture();
    remarkSidenotes()(tree as any);

    const refs = collect(tree, byHName('sup')).filter((n) => hasClass(n, 'sn-ref'));
    const notes = collect(tree, byHName('span')).filter((n) => hasClass(n, 'sidenote'));
    expect(refs).toHaveLength(2);
    expect(notes).toHaveLength(2);
    // Sequential numbering by appearance order, regardless of the source identifiers.
    expect(refs.map((r) => r.children[0].value)).toEqual(['1', '2']);
    // The sidenote carries a <span class="sn-num"> then the definition's inline content,
    // with structure preserved (the emphasis node from the second note survives).
    const num = notes[1].children.find((c: any) => hasClass(c, 'sn-num'));
    expect(num.children[0].value).toBe('2');
    expect(collect(notes[1], (n) => n.type === 'emphasis')).toHaveLength(1);
  });

  it('preserves a leaf block (code) in a footnote definition instead of silently dropping it', () => {
    const tree = {
      type: 'root',
      children: [
        paragraph([text('ref'), { type: 'footnoteReference', identifier: 'c' }]),
        {
          type: 'footnoteDefinition',
          identifier: 'c',
          label: 'c',
          children: [paragraph([text('Intro.')]), { type: 'code', lang: 'js', value: 'const removed = true;' }],
        },
      ],
    };
    remarkSidenotes()(tree as any);
    const note = collect(tree, byHName('span')).find((n) => hasClass(n, 'sidenote'));
    // The intro prose survives...
    expect(collect(note, (n) => n.type === 'text' && n.value === 'Intro.')).toHaveLength(1);
    // ...and the code block's content is preserved inline, not dropped.
    const code = collect(note, (n) => n.type === 'inlineCode');
    expect(code).toHaveLength(1);
    expect(code[0].value).toBe('const removed = true;');
  });

  it('flattens a block container (list) in a footnote definition to inline text, emitting no block tags', () => {
    const listItem = (value: string) => ({
      type: 'listItem',
      children: [paragraph([text(value)])],
    });
    const tree = {
      type: 'root',
      children: [
        paragraph([text('ref'), { type: 'footnoteReference', identifier: 'l' }]),
        {
          type: 'footnoteDefinition',
          identifier: 'l',
          label: 'l',
          children: [{ type: 'list', ordered: false, children: [listItem('one'), listItem('two')] }],
        },
      ],
    };
    remarkSidenotes()(tree as any);
    const note = collect(tree, byHName('span')).find((n) => hasClass(n, 'sidenote'));
    // No block-level list nodes leak into the inline <span> (that HTML is invalid and
    // the browser would hoist it out of the gutter).
    expect(collect(note, (n) => n.type === 'list' || n.type === 'listItem' || n.type === 'paragraph')).toHaveLength(0);
    // Both items' text survives inline.
    expect(collect(note, (n) => n.type === 'text' && n.value === 'one')).toHaveLength(1);
    expect(collect(note, (n) => n.type === 'text' && n.value === 'two')).toHaveLength(1);
  });

  it('resolves a nested footnote reference inside a definition (no dangling link)', () => {
    const tree = {
      type: 'root',
      children: [
        paragraph([text('Ref.'), { type: 'footnoteReference', identifier: '1' }]),
        {
          type: 'footnoteDefinition',
          identifier: '1',
          label: '1',
          children: [paragraph([text('Parent.'), { type: 'footnoteReference', identifier: '2' }])],
        },
        {
          type: 'footnoteDefinition',
          identifier: '2',
          label: '2',
          children: [paragraph([text('Child.')])],
        },
      ],
    };
    remarkSidenotes()(tree as any);
    // No raw footnoteReference survives — a leftover one renders a dangling
    // #user-content-fn-* link (its definition was already removed).
    expect(collect(tree, (n) => n.type === 'footnoteReference')).toHaveLength(0);
    // Both the parent and the nested child note are inlined as sidenotes.
    const notes = collect(tree, byHName('span')).filter((n) => hasClass(n, 'sidenote'));
    expect(notes).toHaveLength(2);
    expect(collect(tree, (n) => n.type === 'text' && n.value === 'Child.')).toHaveLength(1);
  });

  it('renders the reference even when its definition is missing (no empty gutter box)', () => {
    const tree = {
      type: 'root',
      children: [paragraph([text('dangling'), { type: 'footnoteReference', identifier: 'x' }])],
    };
    remarkSidenotes()(tree as any);
    expect(collect(tree, byHName('sup')).filter((n) => hasClass(n, 'sn-ref'))).toHaveLength(1);
    expect(collect(tree, byHName('span')).filter((n) => hasClass(n, 'sidenote'))).toHaveLength(0);
  });
});

describe('remark-callouts', () => {
  it('maps a :::name[Label] container directive to <aside class="callout"> with a co-label', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'containerDirective',
          name: 'note',
          attributes: {},
          children: [
            paragraph([text('The honest edit')], { directiveLabel: true }),
            paragraph([text('AI helps most on small greenfield tools.')]),
          ],
        },
      ],
    };
    remarkCallouts()(tree as any);

    const aside = (tree.children as any[])[0];
    expect(aside.data.hName).toBe('aside');
    expect(hasClass(aside, 'callout')).toBe(true);
    const label = aside.children[0];
    expect(label.data.hName).toBe('div');
    expect(hasClass(label, 'co-label')).toBe(true);
    expect(label.children[0].value).toBe('The honest edit');
    // The body paragraph is preserved after the label.
    expect(aside.children[1].type).toBe('paragraph');
    expect(aside.children[1].children[0].value).toBe('AI helps most on small greenfield tools.');
  });

  it('falls back to the capitalised directive name when no label is given', () => {
    const tree = {
      type: 'root',
      children: [{ type: 'containerDirective', name: 'warn', attributes: {}, children: [paragraph([text('body')])] }],
    };
    remarkCallouts()(tree as any);
    const label = (tree.children as any[])[0].children[0];
    expect(label.children[0].value).toBe('Warn');
  });

  it('leaves non-directive content untouched', () => {
    const tree = { type: 'root', children: [paragraph([text('plain')])] };
    remarkCallouts()(tree as any);
    expect((tree.children as any[])[0].type).toBe('paragraph');
    expect((tree.children as any[])[0].data).toBeUndefined();
  });
});
