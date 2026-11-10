/**
 * Two collections of Markdown/MDX pages:
 *   docs    developer reference at /docs (API, transports, recipes), migrated from the app repo
 *   guides  articles for people using the app at /guides
 *   reference  the hand-written part of one API reference page (/docs/api/<kind>/<name>): what a
 *              method or command is for, examples and caveats, around its <Api> block. The
 *              fields come from the schema (src/lib/api.ts); a page with no file here shows the
 *              schema's own description. The id is "<methods|edits|types>/<name>".
 * `section` groups the sidebar (docs) and the guides index, `order` sorts within a section. The
 * sections are listed in src/lib/docs.ts. A docs `index` entry becomes the section's landing page;
 * the guides landing page is src/pages/guides/index.astro.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { GUIDE_ICONS } from '@/lib/guide-icons';

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
  schema: ({ image }) =>
    page.extend({
      section: z.string().default('Start'),
      /** The <title> for search results, when it should carry more than the page's h1. */
      seoTitle: z.string().optional(),
      /** The icon on the guide's card when it has no cover, by name (src/lib/guide-icons.ts). */
      icon: z.enum(GUIDE_ICONS).default('book'),
      /** A real app capture, shown on the band on the guide's card and at the top of the page. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

const reference = defineCollection({
  loader: glob({
    base: './src/content/reference',
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({}),
});

export const collections = { docs, guides, reference };
