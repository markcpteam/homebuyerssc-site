import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(), description: z.string(),
    pubDate: z.coerce.date(), group: z.string(), oldUrl: z.string(),
  }),
});
const cities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cities' }),
  schema: z.object({ title: z.string(), description: z.string(), city: z.string(), oldUrl: z.string() }),
});
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), description: z.string(), kind: z.string(), oldUrl: z.string() }),
});
export const collections = { guides, cities, pages };
