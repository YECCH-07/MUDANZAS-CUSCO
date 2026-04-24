import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content Collections del sitio (Astro 6 — loaders explícitos).
 * En SPRINT-02 solo testimonios. En sprints siguientes se agregan blog, distritos, rutas, etc.
 */

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    quote: z.string().min(40),
    rating: z.number().int().min(1).max(5).default(5),
    avatar: z.string().optional(),
    order: z.number().int().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { testimonials };
