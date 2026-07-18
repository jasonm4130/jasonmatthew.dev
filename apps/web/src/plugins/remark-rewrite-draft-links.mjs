import { fileURLToPath } from 'node:url';
import { loadArticleStates, isPublished } from '../utils/article-publish.mjs';

const ARTICLES_DIR = fileURLToPath(new URL('../../../../packages/content/articles/', import.meta.url));

function stripLinksToDrafts(node, articles, now, downgraded) {
  if (!Array.isArray(node.children)) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'link') {
      const match = (child.url || '').match(/^\/writing\/([^/?#]+)/);
      // Unknown slug (link to a missing post) is treated as unpublished, as before.
      const state = match ? articles.get(match[1]) : null;
      if (match && (!state || !isPublished(state, now))) {
        node.children.splice(i, 1, ...child.children);
        downgraded.push(match[1]);
        i--;
        continue;
      }
    }
    stripLinksToDrafts(child, articles, now, downgraded);
  }
}

export default function remarkRewriteDraftLinks() {
  return (tree, file) => {
    const articles = loadArticleStates(ARTICLES_DIR);
    const now = Date.now();
    const downgraded = [];
    stripLinksToDrafts(tree, articles, now, downgraded);
    if (downgraded.length > 0) {
      const sourcePath = file?.history?.[file.history.length - 1] || file?.path || 'unknown';
      const fileName = sourcePath.split('/').pop() || sourcePath;
      console.warn(
        `[draft-links] ${fileName}: stripped ${downgraded.length} link(s) to unpublished post(s): ${downgraded.join(', ')}`,
      );
    }
  };
}
