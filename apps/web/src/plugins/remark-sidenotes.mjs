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

/** mdast phrasing (inline) node types — the only nodes valid inside the inline
 * <span class="sidenote">. Everything else is block-level and must be reduced to
 * these before it can enter the gutter. */
const PHRASING = new Set([
  'text',
  'emphasis',
  'strong',
  'delete',
  'inlineCode',
  'break',
  'link',
  'linkReference',
  'image',
  'imageReference',
  'footnoteReference',
  'html',
]);

/** Recursively reduce any definition node to inline phrasing nodes. Phrasing nodes
 * pass through; `code`/other leaf blocks preserve their `value` inline (code degrades
 * to inline `code`); block containers (paragraph, list, listItem, blockquote, table…)
 * recurse into their children — so their text survives without emitting block tags
 * (<li>, <p>) inside a <span>, which the browser would hoist out of the gutter and
 * break the note. Block-level siblings join with a space so their text doesn't mash.
 * Footnotes are short prose by convention: this is a graceful floor, not full block
 * rendering. */
function toInline(node) {
  if (PHRASING.has(node.type)) return [node];
  if (node.type === 'code') return [{ type: 'inlineCode', value: node.value }];
  if (typeof node.value === 'string') return [{ type: 'text', value: node.value }];
  if (!Array.isArray(node.children)) return [];
  const out = [];
  for (const child of node.children) {
    const inline = toInline(child);
    if (!inline.length) continue;
    if (out.length && !PHRASING.has(child.type)) out.push({ type: 'text', value: ' ' });
    out.push(...inline);
  }
  return out;
}

/** Flatten a definition's blocks (usually one paragraph) to inline nodes for the
 * sidenote span, joining separate blocks with a space. */
function inlineFromDefinition(blocks) {
  return toInline({ type: 'root', children: blocks });
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
        const note = sidenoteNode(n, inline);
        node.children.splice(i, 1, supNode(n), note);
        // A definition can itself reference another footnote; resolve those inside the
        // just-inlined note (its definitions were already collected). Without this the
        // nested reference survives as a dangling #user-content-fn-* link, since the
        // outer loop steps past the inserted subtree.
        replaceReferences(note, defs, order);
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
