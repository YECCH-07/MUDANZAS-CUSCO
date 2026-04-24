# SPRINT 07 — Blog SEO y Contenido Inicial

**Duración:** 5 días (Semana 9)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-06 completado.

## Objetivo

Implementar el sistema de blog completo (listado, artículos, categorías, etiquetas, RSS) y publicar los primeros 8 artículos del calendario editorial. Este es el motor de captación de tráfico orgánico de cola larga (long-tail).

## URLs a crear

- `/blog/` — Listado principal
- `/blog/[slug]/` — Artículo individual
- `/blog/categoria/[categoria]/` — Listado por categoría
- `/blog/etiqueta/[etiqueta]/` — Listado por etiqueta
- `/blog/rss.xml` — Feed RSS

## Categorías iniciales

- `consejos-de-mudanza`
- `embalaje`
- `mudanzas-de-oficina`
- `rutas-cusco-apurimac`
- `almacenaje`
- `precios-y-cotizaciones`

## Artículos iniciales (8 obligatorios)

| # | Slug | Título | Categoría | Word count |
|---|------|--------|-----------|------------|
| 1 | `cuanto-cuesta-mudanza-cusco-2026` | Cuánto cuesta una mudanza en Cusco en 2026: guía de precios completa | precios-y-cotizaciones | 1500-2000 |
| 2 | `como-embalar-platos-vajilla-mudanza` | Cómo embalar correctamente platos, copas y vajilla frágil | embalaje | 1200-1500 |
| 3 | `checklist-completo-mudanza` | Checklist completo: 30 cosas antes, durante y después de mudarte | consejos-de-mudanza | 1500-2000 |
| 4 | `mudanza-cusco-sicuani-guia` | Mudanza Cusco-Sicuani: distancia, tiempo, precio y consejos | rutas-cusco-apurimac | 1200-1500 |
| 5 | `mudanza-cusco-challhuahuacho-las-bambas` | Trabajadores de Las Bambas: cómo organizar tu mudanza Cusco-Challhuahuacho | rutas-cusco-apurimac | 1500-1800 |
| 6 | `mudanza-oficina-checklist-empresarial` | Mudanza de oficina: planificación y checklist empresarial | mudanzas-de-oficina | 1500-1800 |
| 7 | `mudanza-estudiantes-unsaac-guia` | Mudanza para estudiantes UNSAAC: guía económica y práctica | consejos-de-mudanza | 1000-1200 |
| 8 | `almacenaje-muebles-cusco-cuando-conviene` | Almacenaje de muebles en Cusco: cuándo conviene y cómo elegir | almacenaje | 1200-1500 |

## Tareas

### Tarea 7.1 — Configurar Content Collection de blog

`src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(20).max(70),
    description: z.string().min(120).max(170),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Yeison'),
    category: z.enum([
      'consejos-de-mudanza',
      'embalaje',
      'mudanzas-de-oficina',
      'rutas-cusco-apurimac',
      'almacenaje',
      'precios-y-cotizaciones',
    ]),
    tags: z.array(z.string()),
    heroImage: z.string(),
    heroImageAlt: z.string(),
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

### Tarea 7.2 — Crear estructura de archivos

```
src/content/blog/
├── cuanto-cuesta-mudanza-cusco-2026.mdx
├── como-embalar-platos-vajilla-mudanza.mdx
├── checklist-completo-mudanza.mdx
├── mudanza-cusco-sicuani-guia.mdx
├── mudanza-cusco-challhuahuacho-las-bambas.mdx
├── mudanza-oficina-checklist-empresarial.mdx
├── mudanza-estudiantes-unsaac-guia.mdx
└── almacenaje-muebles-cusco-cuando-conviene.mdx
```

### Tarea 7.3 — Plantilla de artículo MDX

```mdx
---
title: 'Cuánto cuesta una mudanza en Cusco en 2026: guía de precios completa'
description: 'Conoce los precios reales de mudanzas en Cusco en 2026. Tarifas por tipo, distrito, distancia y volumen. Guía completa para presupuestar bien.'
pubDate: 2026-04-23
category: precios-y-cotizaciones
tags: [precios, mudanzas, cusco, presupuesto]
heroImage: /wp-content/uploads/2024/05/MUDANZAS-CUSCO.png
heroImageAlt: 'Camión de mudanzas en Cusco con equipo profesional'
---

import CTAWhatsApp from '@/components/blog/CTAWhatsApp.astro';
import PriceTable from '@/components/blog/PriceTable.astro';

Si estás planificando una mudanza en Cusco, lo primero que querrás saber es cuánto te va a costar. En esta guía compartimos un análisis honesto y actualizado de los precios reales de mudanzas en Cusco para 2026...

## ¿De qué depende el precio de una mudanza?

Tres factores principales determinan el costo final...

### 1. Volumen de carga

...

## Tabla de precios referenciales 2026

<PriceTable />

## Errores comunes al cotizar

...

## ¿Cómo asegurar el mejor precio?

...

<CTAWhatsApp message="Hola, leí su artículo sobre precios. Me gustaría una cotización personalizada para mi mudanza." />
```

### Tarea 7.4 — Crear `src/pages/blog/index.astro`

Listado principal con grid de cards. Paginación cada 12 artículos. Filtros por categoría.

### Tarea 7.5 — Crear `src/pages/blog/[slug].astro`

Página individual del artículo con:
- Hero con imagen destacada
- Meta info (autor, fecha, tiempo lectura, categoría)
- Tabla de contenido (TOC) si > 800 palabras
- Contenido formateado
- CTA al final
- Artículos relacionados (3, misma categoría)
- Breadcrumbs
- Botones de compartir
- Schema.org Article

### Tarea 7.6 — Páginas de categoría y etiqueta

- `src/pages/blog/categoria/[categoria].astro`
- `src/pages/blog/etiqueta/[tag].astro`

### Tarea 7.7 — RSS feed

```bash
npx astro add rss
```

Crear `src/pages/blog/rss.xml.js`:

```javascript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: 'Blog Expresos Ñan | Mudanzas Cusco',
    description: 'Consejos, guías y novedades sobre mudanzas, fletes y almacenaje en Cusco.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
```

### Tarea 7.8 — Schema.org Article

Cada artículo incluye:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "...",
  "image": "...",
  "datePublished": "...",
  "dateModified": "...",
  "author": { "@type": "Person", "name": "Yeison" },
  "publisher": { "@id": "#localbusiness" },
  "mainEntityOfPage": "..."
}
```

### Tarea 7.9 — Componente `<TableOfContents>`

Para artículos largos. Genera lista de H2/H3 con anclas. Sticky en lateral o flotante.

### Tarea 7.10 — Redirección 301 de RSS antiguo

En Nginx (más adelante, Sprint 10), agregar:
```
location = /feed/ {
  return 301 /blog/rss.xml;
}
```

Anotar este detalle en `docs/SEO-PRESERVATION.md`.

### Tarea 7.11 — Redactar y publicar 8 artículos

Cada artículo debe:
- Cumplir el word count mínimo
- Tener H2/H3 estructurados
- Incluir 3-5 enlaces internos a páginas del sitio
- Imagen destacada + 2-4 imágenes en el cuerpo
- CTA WhatsApp al final
- Datos verificables (precios, tiempos)

### Tarea 7.12 — Agregar bloque "Blog reciente" en Home

En la página Home (Sprint 02), incorporar la sección que muestra los últimos 3 artículos del blog.

## Criterios de Aceptación

- [ ] Sistema de blog funcional (listado, individual, categorías, etiquetas)
- [ ] 8 artículos publicados sin draft
- [ ] RSS feed accesible en `/blog/rss.xml`
- [ ] Schema Article validado
- [ ] TOC en artículos largos
- [ ] Internal linking implementado
- [ ] Lighthouse 95+ en blog y artículos
- [ ] Bloque "Blog reciente" en Home

## Siguiente Sprint

**[SPRINT-08 — Internacionalización (Inglés)](SPRINT-08-i18n-english.md)**
