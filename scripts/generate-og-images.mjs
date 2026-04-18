// scripts/generate-og-images.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import matter from 'gray-matter';
import { renderToPng } from './og-templates/render.mjs';
import { blogTemplate } from './og-templates/blog.mjs';
import { projectTemplate } from './og-templates/project.mjs';
import { defaultTemplate } from './og-templates/default.mjs';
import { faviconTemplate, faviconSvgContent } from './og-templates/favicon.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const CONTENT_DIR = join(ROOT, 'packages/content');
const PUBLIC_DIR = join(ROOT, 'apps/web/public');

/**
 * Read all MDX files from a directory and parse frontmatter.
 */
function readContent(subdir) {
  const dir = join(CONTENT_DIR, subdir);
  let files;
  try {
    files = readdirSync(dir).filter((f) => extname(f) === '.mdx' || extname(f) === '.md');
  } catch {
    console.log(`  No content directory: ${subdir}`);
    return [];
  }
  return files.map((file) => {
    const raw = readFileSync(join(dir, file), 'utf-8');
    const { data } = matter(raw);
    const slug = basename(file, extname(file));
    return { slug, data };
  });
}

/**
 * Format a date for display on OG cards.
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Write a PNG buffer to disk, creating directories as needed.
 */
function writePng(relativePath, buffer) {
  const fullPath = join(PUBLIC_DIR, relativePath);
  mkdirSync(join(fullPath, '..'), { recursive: true });
  writeFileSync(fullPath, buffer);
  console.log(`  ✓ ${relativePath}`);
}

async function generateOgImages() {
  console.log('\nGenerating OG images...\n');

  // Blog posts
  const articles = readContent('articles');
  const publishedArticles = articles.filter(
    (a) => !a.data.draft && a.data.publishDate && new Date(a.data.publishDate) <= new Date(),
  );
  for (const { slug, data } of publishedArticles) {
    const markup = blogTemplate({
      title: data.title,
      date: formatDate(data.publishDate),
      tags: data.tags || [],
    });
    const png = await renderToPng(markup);
    writePng(`og/blog/${slug}.png`, png);
  }

  // Projects
  const projects = readContent('projects');
  const publishedProjects = projects.filter(
    (p) => !p.data.draft && p.data.publishDate && new Date(p.data.publishDate) <= new Date(),
  );
  for (const { slug, data } of publishedProjects) {
    const markup = projectTemplate({
      title: data.title,
      description: data.description || '',
      technologies: data.technologies || [],
    });
    const png = await renderToPng(markup);
    writePng(`og/projects/${slug}.png`, png);
  }

  // Default card
  const defaultMarkup = defaultTemplate();
  const defaultPng = await renderToPng(defaultMarkup);
  writePng('og/default.png', defaultPng);
}

async function generateFavicons() {
  console.log('Generating favicons...\n');

  // favicon-512.png
  const favicon512 = await renderToPng(faviconTemplate(), {
    width: 512,
    height: 512,
  });
  writePng('favicon-512.png', favicon512);

  // apple-touch-icon.png
  const appleTouchIcon = await renderToPng(faviconTemplate(), {
    width: 180,
    height: 180,
  });
  writePng('apple-touch-icon.png', appleTouchIcon);

  // favicon.svg
  const svgContent = faviconSvgContent();
  const svgPath = join(PUBLIC_DIR, 'favicon.svg');
  writeFileSync(svgPath, svgContent);
  console.log('  ✓ favicon.svg');
}

async function main() {
  const start = performance.now();
  await generateOgImages();
  await generateFavicons();
  const elapsed = ((performance.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s\n`);
}

main().catch((err) => {
  console.error('OG generation failed:', err);
  process.exit(1);
});
