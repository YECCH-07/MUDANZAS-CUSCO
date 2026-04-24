# SEO Preservation — Reglas Inviolables

> Este documento define las reglas que NUNCA se deben violar para preservar el posicionamiento orgánico de cuscomudanzas.com durante y después de la migración.

## Regla #1 — URLs Preservadas

Estas URLs del WordPress actual **NO PUEDEN cambiar bajo ninguna circunstancia**:

- `/`
- `/about/`
- `/contact/`
- `/projects/`
- `/preguntas-frecuentes/`
- `/servicio-de-caraga-flete-y-mudanza-cusco/`
- `/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/`
- `/mudanza-provincia/`
- `/mudanzas-de-o/`

Si por error se cambia una URL preservada, configurar redirección 301 inmediatamente.

## Regla #2 — Trailing Slash Obligatorio

TODAS las URLs deben terminar en `/` (consistencia con WordPress original).

```
✅ /mudanzas-wanchaq/
❌ /mudanzas-wanchaq
```

Configurar Astro:
```javascript
// astro.config.mjs
trailingSlash: 'always',
build: { format: 'directory' }
```

Configurar Nginx para redirigir URLs sin trailing slash:
```nginx
rewrite ^([^.]*[^/])$ $1/ permanent;
```

## Regla #3 — Meta Tags Idénticos o Mejores

Los meta tags actuales deben preservarse o mejorarse. NUNCA empeorar.

### Página Home (referencia actual)

```html
<title>Servicio De Mudanza En Cusco | Expresos Ñan</title>
<meta name="description" content="Ofrecemos un servicio de mudanza completo que incluye embalaje, transporte, carga y descarga de tus pertenencias. Nos encargamos de todo..."/>
```

Mantener título exacto. Description puede mejorar pero conservar palabras clave.

## Regla #4 — Imágenes Legacy en `/wp-content/uploads/`

Las URLs de imágenes del WordPress original deben seguir siendo accesibles. Lista de imágenes a preservar (ya descargadas):

- `NAN-2.png` (logo)
- `NAN-2-120x120.png`
- `NAN-2-300x300.png`
- `servicio-de-mudanzas-Flete-Carga-Logo-Expreso-Nan.png` (logo horizontal)
- `EMBALAJE-CUSCO.png`
- `MUDANZAS-CUSCO.png`
- `SERVICIO-DE-MUDANZA-CUSCO.png`
- `MUDANZA-PERSONALIZADA-CUSCO.png`
- `CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg` (filename heredado, unidad real es 4T)
- `SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg`
- `MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg`
- `ARMADO-Y-DESARMADO-DE-MUEBLES-CUSCO-MUDANZAS.jpg`
- `CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg`
- `SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg`
- `pexels-photo-1222271.jpeg` (testimonio)
- `michael-frattaroli-234665-unsplash.jpg` (testimonio)
- `pexels-photo-253758.jpeg` (testimonio)

Estas imágenes deben colocarse en `public/wp-content/uploads/2024/05/` para que sus URLs originales sigan funcionando.

## Regla #5 — Headings Hierarchy

Mantener un solo `<h1>` por página, jerarquía sin saltos:

```html
<h1>Título principal de la página</h1>
  <h2>Sección</h2>
    <h3>Subsección</h3>
  <h2>Otra sección</h2>
```

Los H1 actuales (preservar texto):
- Home: "Mudanzas Profesionales en Cusco - Transporte Seguro y Confiable"
- Otros: ver inventario

## Regla #6 — Schema.org

Migrar y MEJORAR los datos estructurados existentes:

### Lo que YA tiene el WP (preservar)
- `Person` (Yeison)
- `Organization` (MUDANZAS CUSCO)
- `WebSite`
- `WebPage`
- `Article` (en homepage — REEMPLAZAR por LocalBusiness, más apropiado)
- `ImageObject`

### Lo que vamos a AÑADIR
- `MovingCompany` (extiende LocalBusiness, más específico)
- `Service` (en cada página de servicio)
- `BreadcrumbList` (en todas excepto home)
- `FAQPage` (en FAQs y páginas con FAQs)
- `Review` + `AggregateRating` (con testimonios)
- `BlogPosting` (en cada artículo)

## Regla #7 — Redirecciones 301 Globales

Configurar en Nginx (Sprint 10):

```nginx
# Trailing slash
rewrite ^([^.]*[^/])$ $1/ permanent;

# www → no-www (verificar configuración actual primero)
server_name www.cuscomudanzas.com;
return 301 https://cuscomudanzas.com$request_uri;

# HTTP → HTTPS
listen 80;
return 301 https://cuscomudanzas.com$request_uri;

# RSS antiguo
location = /feed/ { return 301 /blog/rss.xml; }

# WP admin (cerrar)
location ~ ^/wp-admin { return 410; }
location ~ ^/wp-login.php { return 410; }
location = /comments/feed/ { return 410; }

# Author pages (no exponer)
location ~ ^/author/ { return 410; }

# Categorías y tags WP (si existían)
location ~ ^/category/(.*) { return 301 /blog/categoria/$1/; }
location ~ ^/tag/(.*) { return 301 /blog/etiqueta/$1/; }
```

## Regla #8 — Hreflang Correcto

En cada página bilingüe, en `<head>`:

```html
<link rel="alternate" hreflang="es" href="https://cuscomudanzas.com/[path-es]/" />
<link rel="alternate" hreflang="en" href="https://cuscomudanzas.com/en/[path-en]/" />
<link rel="alternate" hreflang="x-default" href="https://cuscomudanzas.com/[path-es]/" />
```

## Regla #9 — Canonical en Cada Página

```html
<link rel="canonical" href="https://cuscomudanzas.com/[path]/" />
```

Sin parámetros. Sin trailing slash inconsistente. Una sola URL canónica por contenido.

## Regla #10 — Sitemap y Robots.txt

### sitemap.xml (auto-generado por Astro)

Debe estar en `/sitemap-index.xml`. Incluir TODAS las URLs indexables (ES + EN).

Configurar en Search Console y Bing Webmaster.

### robots.txt

```txt
User-agent: *
Allow: /

Disallow: /styleguide/
Disallow: /admin/
Disallow: /api/

Sitemap: https://cuscomudanzas.com/sitemap-index.xml
```

NUNCA `Disallow: /` global. Eso bloquea todo el sitio para Google.

## Regla #11 — Open Graph + Twitter Cards

Cada página debe tener:

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://cuscomudanzas.com/og-images/..." />
<meta property="og:url" content="..." />
<meta property="og:type" content="website" />
<meta property="og:locale" content="es_PE" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

## Regla #12 — Internal Linking

Cada página debe tener mínimo 3-5 enlaces internos contextuales con texto ancla descriptivo.

```html
✅ <a href="/almacenaje-y-custodia-cusco/">servicio de almacenaje en Cusco</a>
❌ <a href="/almacenaje-y-custodia-cusco/">clic aquí</a>
```

## Regla #13 — Velocidad

Lighthouse Performance ≥ 95 obligatorio en TODAS las páginas indexables.

Si una página no llega: optimizar imágenes, diferir JS, simplificar CSS, antes de publicar.

## Regla #14 — No Tocar el WordPress Hasta el Lanzamiento

Hasta el Día D, el WordPress original sigue corriendo en producción. NO hacer cambios en él.

## Regla #15 — Backup del WordPress por 90 Días

Después del lanzamiento, mantener backup completo del WordPress (archivos + DB) durante 90 días para reversión rápida si fuese necesario.

## Checklist de Verificación Pre-Lanzamiento

- [ ] Las 9 URLs preservadas responden 200 en staging
- [ ] Meta tags idénticos o mejorados verificados con Screaming Frog
- [ ] Imágenes legacy accesibles bajo `/wp-content/uploads/...`
- [ ] H1 único por página, jerarquía correcta
- [ ] Schema.org validado en Rich Results Test
- [ ] Trailing slash consistente
- [ ] Hreflang correcto entre ES y EN
- [ ] Canonical en cada página
- [ ] Sitemap accesible y válido
- [ ] Robots.txt no bloquea contenido importante
- [ ] OG/Twitter Cards en todas las páginas
- [ ] Mínimo 3-5 enlaces internos por página
- [ ] Lighthouse Performance ≥ 95 en todas
- [ ] Backup full del WordPress disponible
