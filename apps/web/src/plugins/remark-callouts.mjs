// Remap `:::` container directives (parsed by remark-directive) to the notebook's
// single callout treatment — <aside class="callout"> with a <div class="co-label">
// heading, styled mono + coral in global.css (no multicolor, no per-type variants).
//
// Convention: `:::note[Label]` — the `[Label]` becomes the co-label. Without a label
// the directive name is used, capitalised (`:::warn` → "Warn"). A `label="…"`
// attribute is honoured as a fallback. Dependency-free hand-walk; the aside is built
// with `data.hName`/`hProperties` (the mdast → hast extension point).

function toText(node) {
  if (typeof node.value === 'string') return node.value;
  if (Array.isArray(node.children)) return node.children.map(toText).join('');
  return '';
}

function capitalise(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function transform(node) {
  if (!Array.isArray(node.children)) return;
  for (const child of node.children) {
    if (child.type === 'containerDirective') {
      const kids = Array.isArray(child.children) ? child.children : [];
      const first = kids[0];
      let label;
      let body = kids;
      if (first && first.data && first.data.directiveLabel) {
        label = toText(first);
        body = kids.slice(1);
      } else if (child.attributes && child.attributes.label) {
        label = child.attributes.label;
      } else {
        label = capitalise(child.name ?? 'Note');
      }
      child.data = { ...(child.data ?? {}), hName: 'aside', hProperties: { className: ['callout'] } };
      child.children = [
        {
          type: 'calloutLabel',
          data: { hName: 'div', hProperties: { className: ['co-label'] } },
          children: [{ type: 'text', value: label }],
        },
        ...body,
      ];
    }
    transform(child);
  }
}

export default function remarkCallouts() {
  return (tree) => transform(tree);
}
