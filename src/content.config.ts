import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content Collections del sitio (Astro 6 — loaders explícitos).
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

/**
 * Distritos de Cusco metropolitano con landing individual (SPRINT-05).
 * El slug del JSON se convierte en la URL `/mudanzas-[slug]/`.
 */
const districts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/districts' }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    province: z.string(),
    region: z.string(),
    metaTitle: z.string().max(70),
    metaDescription: z.string().min(120).max(180),
    ogImage: z.string(),

    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),

    heroEyebrow: z.string(),
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    heroImage: z.string(),
    heroImageAlt: z.string(),

    description: z.array(z.string()).min(2),

    mainStreets: z.array(z.string()).min(1),
    landmarks: z.array(z.string()).min(1),
    challenges: z.string(),

    services: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        href: z.string(),
      }),
    ),

    priceTable: z
      .object({
        note: z.string().optional(),
        rows: z.array(
          z.object({
            label: z.string(),
            price: z.string(),
            notes: z.string().optional(),
          }),
        ),
      })
      .optional(),

    faqs: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        }),
      )
      .min(3),

    /** Slugs de distritos cercanos (del mismo content collection) para internal linking. */
    nearbyDistricts: z.array(z.string()).max(4),

    ctaMessage: z.string(),
    ctaTitle: z.string(),
    ctaSubtitle: z.string().optional(),
  }),
});

export const collections = { testimonials, districts };
