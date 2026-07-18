// Compute a reading-time estimate at build time and expose it on the article
// frontmatter as `minutesRead`, so templates + stream rows can show "8 min"
// without any runtime cost. Dependency-free: it walks the mdast tree and counts
// words in the text-bearing nodes (prose + inline code), skipping fenced code
// blocks — which read far slower than 200 wpm and would inflate the estimate.

const WORDS_PER_MINUTE = 200;

function countWords(node) {
  if (node.type === 'code') return 0; // skip fenced blocks
  let words = 0;
  if (typeof node.value === 'string' && (node.type === 'text' || node.type === 'inlineCode')) {
    const trimmed = node.value.trim();
    if (trimmed) words += trimmed.split(/\s+/).length;
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) words += countWords(child);
  }
  return words;
}

export default function remarkReadingTime() {
  return (tree, file) => {
    const words = countWords(tree);
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.minutesRead = minutes;
    file.data.astro.frontmatter.words = words;
  };
}
