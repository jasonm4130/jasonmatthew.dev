import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const imageSchema = z.object({
  src: z.string(),
  alt: z.string().optional().default(''),
});

// Notebook content graph (additive, backward-compatible — see the lab-notebook IA).
// `kind` gives each article a per-genre affordance; `threads` are durable topic
// areas (multi-membership) whose titles/descriptions live in src/data/threads.ts —
// content references a thread by slug only. `series` is the orthogonal, optional
// single ordered arc. Cross-entry referential integrity (thread slug exists,
// series order contiguous, related.href resolves to a published entry) is enforced
// at build time by src/utils/content-graph.ts — Zod validates one entry at a time
// and can't see the whole graph.
export const ARTICLE_KINDS = ['essay', 'buildlog', 'incident', 'architecture'] as const;

const relatedLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const metricSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const seoSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(15).max(160).optional(),
  image: imageSchema.optional(),
  pageType: z.enum(['website', 'article']).default('website'),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: '../../packages/content/articles' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    image: imageSchema.optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    kind: z.enum(ARTICLE_KINDS).default('essay'),
    threads: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    related: z.array(relatedLinkSchema).optional(),
    seo: seoSchema.optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: '../../packages/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    image: imageSchema.optional(),
    technologies: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    role: z.string().optional(),
    sortOrder: z.number().optional(),
    threads: z.array(z.string()).default([]),
    related: z.array(relatedLinkSchema).optional(),
    metrics: z.array(metricSchema).optional(),
    seo: seoSchema.optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: '../../packages/content/pages' }),
  schema: z.object({
    title: z.string(),
    seo: seoSchema.optional(),
  }),
});

export const collections = { blog, projects, pages };
