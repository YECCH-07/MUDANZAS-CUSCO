# SPRINT 09 — SEO Técnico Completo

**Duración:** 5 días (Semana 11)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-08 completado.

## Objetivo

Llevar el SEO técnico del sitio al máximo nivel posible: Schema.org completo, sitemap optimizado, robots.txt correcto, Open Graph + Twitter Cards en todas las páginas, validación FAQ, Local Business y Breadcrumbs en cada página relevante.

## Tareas

### Tarea 9.1 — Schema.org `LocalBusiness` global

Crear `src/components/SchemaLocalBusiness.astro` y montarlo en `BaseLayout`:

```astro
---
const lang = getLangFromUrl(Astro.url);
---

<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "MovingCompany",
  "@id": "https://cuscomudanzas.com/#localbusiness",
  "name": "Expresos Ñan - Mudanzas Cusco",
  "image": "https://cuscomudanzas.com/wp-content/uploads/2024/05/NAN-2.png",
  "url": "https://cuscomudanzas.com/",
  "telephone": "+51925671052",
  "email": "mudanzasexpresoqhapaq@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "René de la Molina",
    "addressLocality": "Cusco",
    "addressRegion": "Cusco",
    "postalCode": "08004",
    "addressCountry": "PE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -13.5319,
    "longitude": -71.9675
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "07:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "08:00",
      "closes": "18:00"
    }
  ],
  "areaServed": [
    "Cusco", "Wanchaq", "San Sebastián", "San Jerónimo", "Santiago", "Saylla", "Poroy",
    "Sicuani", "Abancay", "Challhuahuacho", "Tambobamba", "Haquira", "Mara", "Coyllurqui", "Colquemarca", "Capacmarca"
  ],
  "priceRange": "$$",
  "paymentAccepted": ["Cash", "Bank Transfer", "Yape", "Plin"],
  "currenciesAccepted": "PEN",
  "sameAs": [
    "https://www.facebook.com/ExpresoQhapaq",
    "https://www.facebook.com/MudanzaCusco1",
    "https://www.instagram.com/cuscomudanzas1",
    "https://tiktok.com/@MudanzasCusco11"
  ],
  "inLanguage": [lang]
})} />
```

### Tarea 9.2 — Schema.org `Service` por servicio

Componente `<SchemaService>` reutilizable que recibe props del servicio.

### Tarea 9.3 — Schema.org `BreadcrumbList`

Componente `<SchemaBreadcrumb>` que se monta automáticamente en cada página excepto el home.

### Tarea 9.4 — Schema.org `FAQPage`

Componente `<SchemaFAQ>` que recibe array de preguntas/respuestas. Se monta en:
- `/preguntas-frecuentes/`
- Cada página de servicio con FAQs específicas

### Tarea 9.5 — Schema.org `Article` para blog

Ya implementado en SPRINT-07. Verificar y validar con Rich Results Test.

### Tarea 9.6 — Schema.org `Review` y `AggregateRating`

Si hay testimonios verificables, marcado Review por testimonio + AggregateRating consolidado en LocalBusiness.

### Tarea 9.7 — Open Graph + Twitter Cards completos

Verificar que cada página tiene:

```html
<meta property="og:type" content="website" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="..." />
<meta property="og:image" content="https://cuscomudanzas.com/og-image-default.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="es_PE" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:site_name" content="Expresos Ñan" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

Crear imágenes OG dedicadas (1200×630) para:
- Home
- Cada servicio principal
- Cada categoría de blog

### Tarea 9.8 — Sitemap optimizado

Configurar `astro.config.mjs` para generar:
- `/sitemap-index.xml` (índice)
- `/sitemap-0.xml` (URLs)

Verificar que incluye:
- Todas las URLs en español
- Todas las URLs en inglés (con hreflang en sitemap)
- Última fecha de modificación
- Prioridad y frecuencia de cambio

### Tarea 9.9 — `robots.txt`

```txt
User-agent: *
Allow: /

# Bloqueos específicos
Disallow: /styleguide/
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: https://cuscomudanzas.com/sitemap-index.xml
```

Crear `public/robots.txt`.

### Tarea 9.10 — Canonical en cada página

Verificar que cada página tiene `<link rel="canonical" href="https://cuscomudanzas.com/PATH/">`.

### Tarea 9.11 — Manejo correcto de imágenes

Para cada imagen importante:
- `loading="lazy"` (excepto LCP image)
- `decoding="async"`
- `width` y `height` explícitos
- Formato WebP/AVIF con fallback
- `alt` descriptivo y único

### Tarea 9.12 — Encabezados HTTP optimizados (definidos para Sprint 10)

Documentar headers que Nginx debe enviar:

```
Cache-Control para HTML: public, max-age=300, must-revalidate
Cache-Control para CSS/JS con hash: public, max-age=31536000, immutable
Cache-Control para imágenes: public, max-age=31536000, immutable
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: [definir lista permitida]
```

### Tarea 9.13 — Auditoría completa

Ejecutar:
- Lighthouse en home + 10 páginas críticas
- Screaming Frog crawl completo
- Rich Results Test en todas las páginas con Schema
- Mobile-Friendly Test
- hreflang Tags Testing Tool

Generar reporte y resolver TODOS los hallazgos.

### Tarea 9.14 — Página de búsqueda interna (opcional)

`/buscar/` con buscador en cliente. Solo si tiempo lo permite.

## Criterios de Aceptación

- [ ] Schema.org en todas las páginas validado sin errores
- [ ] Sitemap accesible y válido
- [ ] robots.txt correcto
- [ ] OG/Twitter Cards en todas las páginas
- [ ] Lighthouse SEO = 100 en TODAS las páginas
- [ ] hreflang validado
- [ ] Mobile-Friendly Test pasa en todas
- [ ] Imágenes optimizadas (WebP/AVIF + alt)
- [ ] Reporte de auditoría sin hallazgos críticos

## Siguiente Sprint

**[SPRINT-10 — VPS Setup y Deploy](SPRINT-10-vps-deploy.md)**
