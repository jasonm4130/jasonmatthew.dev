import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const imageSchema = z.object({
  src: z.string(),
  alt: z.string().optional().default(''),
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
