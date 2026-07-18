// Convert GFM footnotes into Tufte-style margin notes (the article template's
// sidenote gutter). Each `[^n]` reference becomes an inline <sup class="sn-ref">
// plus an inline <span class="sidenote"> carrying the note — a <span class="sn-num">
// followed by the definition's own inline content — which CSS floats into the
// article's right gutter (and inlines on mobile). The bottom "Footnotes" section GFM
// would otherwise generate is removed: definitions are inlined at their reference
// sites and renumbered 1..n by order of appearance, regardless of the source labels.
//
// Dependency-free hand-walk (matching the repo's other remark plugins). Nodes are
// emitted with `data.hName`/`hProperties`, the documented mdast → hast extension
// point mdast-util-to-hast honours for any node type.

/** Depth-first: pull every footnoteDefinition out of the tree into `defs` (id → its
 * block children), removing the nodes so no footnotes section is generated. */
function collectDefinitions(node, defs) {
  if (!Array.isArray(node.children)) return;
  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i];
    if (child.type === 'footnoteDefinition') {
      defs.set(child.identifier, child.children ?? []);
      node.children.splice(i, 1);
    } else {
      collectDefinitions(child, defs);
    }
  }
}

/** Flatten a definition's block children (usually one paragraph) to inline nodes,
 * joining separate blocks with a space. Footnotes are short prose by convention. */
function inlineFromDefinition(blocks) {
  const out = [];
  for (const block of blocks) {
    const kids = Array.isArray(block.children) ? block.children : [];
    if (out.length && kids.length) out.push({ type: 'text', value: ' ' });
    out.push(...kids);
  }
  return out;
}

function supNode(n) {
  return {
    type: 'sidenoteRef',
    data: { hName: 'sup', hProperties: { className: ['sn-ref'] } },
    children: [{ type: 'text', value: String(n) }],
  };
}

function sidenoteNode(n, inline) {
  return {
    type: 'sidenote',
    data: { hName: 'span', hProperties: { className: ['sidenote'] } },
    children: [
      {
        type: 'sidenoteNum',
        data: { hName: 'span', hProperties: { className: ['sn-num'] } },
        children: [{ type: 'text', value: String(n) }],
      },
      ...inline,
    ],
  };
}

function replaceReferences(node, defs, order) {
  if (!Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'footnoteReference') {
      const id = child.identifier;
      let n = order.get(id);
      if (n == null) {
        n = order.size + 1;
        order.set(id, n);
      }
      if (defs.has(id)) {
        const inline = inlineFromDefinition(defs.get(id));
        node.children.splice(i, 1, supNode(n), sidenoteNode(n, inline));
        i += 1; // step past the inserted sidenote
      } else {
        // Dangling reference (no definition): keep the marker, add no empty gutter box.
        node.children.splice(i, 1, supNode(n));
      }
      continue;
    }
    replaceReferences(child, defs, order);
  }
}

export default function remarkSidenotes() {
  return (tree) => {
    const defs = new Map();
    collectDefinitions(tree, defs);
    replaceReferences(tree, defs, new Map());
  };
}
