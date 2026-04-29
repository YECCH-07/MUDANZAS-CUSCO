# Headers HTTP recomendados — Nginx (SPRINT-10)

Este documento define los encabezados HTTP que Nginx debe emitir cuando se monte
el sitio estático generado por Astro. Se consume en SPRINT-10 (VPS + Deploy).

## Cache-Control

| Tipo de recurso                          | Regla                                  | Racional                                                                     |
| ---------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| HTML (`.html`, `/*/`)                    | `public, max-age=300, must-revalidate` | 5 minutos para permitir cambios de contenido pronto sin martillar el origen. |
| CSS / JS con hash                        | `public, max-age=31536000, immutable`  | Astro emite archivos con hash en el nombre — son inmutables por definición.  |
| Imágenes optimizadas (`/_astro/`)        | `public, max-age=31536000, immutable`  | Idem.                                                                        |
| Imágenes legacy (`/wp-content/uploads/`) | `public, max-age=2592000`              | 30 días; podrían actualizarse manualmente.                                   |
| Fuentes (`/fonts/`)                      | `public, max-age=31536000, immutable`  | Fuentes autoalojadas no cambian.                                             |
| `robots.txt`, `sitemap*.xml`             | `public, max-age=3600`                 | 1 hora para que Google vea cambios relativamente rápido.                     |

## Seguridad

| Header                           | Valor                                                          |
| -------------------------------- | -------------------------------------------------------------- |
| `Strict-Transport-Security`      | `max-age=31536000; includeSubDomains; preload`                 |
| `X-Content-Type-Options`         | `nosniff`                                                      |
| `X-Frame-Options`                | `SAMEORIGIN`                                                   |
| `Referrer-Policy`                | `strict-origin-when-cross-origin`                              |
| `Permissions-Policy`             | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |
| `Content-Security-Policy` (base) | ver tabla CSP más abajo                                        |

### CSP propuesto

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://unpkg.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
img-src 'self' data: https://cuscomudanzas.com https://*.tile.openstreetmap.org https://www.facebook.com https://www.google-analytics.com;
font-src 'self' https://fonts.gstatic.com data:;
connect-src 'self' https://www.google-analytics.com https://www.facebook.com https://api.web3forms.com;
frame-src https://www.facebook.com;
form-action 'self' https://api.web3forms.com;
base-uri 'self';
object-src 'none';
```

- `unsafe-inline` en `style-src` es necesario por Tailwind runtime hints y el JSON-LD inline.
- El CSP es intencionalmente flexible al inicio; endurecerlo requiere reemplazar los `set:html={JSON.stringify(...)}` por nonces dinámicos (no disponible en SSG sin edge).
- Revisar tras el lanzamiento con `https://report-uri.com` si se habilita reporting.

## Compresión

Habilitar `gzip` y `brotli`:

```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
gzip_min_length 256;

# Requiere módulo ngx_brotli compilado o Webuzo con compatibilidad.
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
```

## Redirecciones 301

Se ejecutan en Nginx para preservar las 9 URLs del WordPress original (ver
`docs/SEO-PRESERVATION.md`). El listado definitivo vive en ese documento; aquí
solo el patrón sugerido:

```nginx
# Forzar https + apex
if ($host = www.cuscomudanzas.com) {
  return 301 https://cuscomudanzas.com$request_uri;
}

# Asegurar trailing slash a todas las rutas sin extensión
rewrite ^([^.]*[^/])$ $1/ permanent;
```

## Fallback 404 / 500

Astro genera `/404.html` y `/500.html`. Nginx:

```nginx
error_page 404 /404.html;
error_page 500 502 503 504 /500.html;
```

## Siguiente paso

SPRINT-10 convierte estas reglas en `server/nginx/cuscomudanzas.conf`.
