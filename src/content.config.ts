/**
 * Two collections of Markdown/MDX pages:
 *   docs    developer reference at /docs (API, transports, recipes), migrated from the app repo
 *   guides  pages for people using the app at /guides
 * `section` groups the sidebar, `order` sorts within a section. The docs sections are listed in
 * src/lib/docs.ts. An `index` entry becomes the section's landing page.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const page = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number().default(0),
});

const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
  schema: page.extend({ section: z.string() }),
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: page.extend({ section: z.string().default('Guides') }),
});

export const collections = { docs, guides };
