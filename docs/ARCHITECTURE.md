# Arquitectura Técnica

## Vista General

```
┌─────────────────────────────────────────────────────────┐
│                       Internet                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                Cloudflare (Free Tier)                   │
│  • CDN global                                           │
│  • WAF + DDoS protection                                │
│  • SSL adicional                                        │
│  • Caché agresivo (HTML 5min, assets 1año)              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│        VPS AlmaLinux 9.7 (50.31.190.36)                 │
│                                                         │
│  ┌────────────────────────────────────────────┐         │
│  │           Nginx 1.24+ (puerto 443)         │         │
│  │  • Sirve archivos estáticos                │         │
│  │  • SSL Let's Encrypt                       │         │
│  │  • Headers de seguridad                    │         │
│  │  • Compresión Brotli/Gzip                  │         │
│  │  • Caché HTTP                              │         │
│  └─────────┬──────────────────────────────────┘         │
│            │                                            │
│            ├──> /var/www/cuscomudanzas/dist/  (Astro)   │
│            │                                            │
│            └──> proxy_pass :8080  (Webuzo Apache,       │
│                                    otros 13 dominios)   │
│                                                         │
│  ┌────────────────────────────────────────────┐         │
│  │        Webuzo Apache (puerto 8080)         │         │
│  │  • Otros 13 dominios del cliente           │         │
│  │  • PHP, MySQL, gestión de mail, etc.       │         │
│  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

## Decisiones Arquitectónicas

### ¿Por qué Astro y no otro framework?

| Framework | Por qué SÍ | Por qué NO |
|-----------|-----------|------------|
| **Astro** | SSG nativo, cero JS por defecto, HTML semántico, excelente DX, soporte i18n | — |
| Next.js | Más popular, ecosistema enorme | Envía React entero al cliente, más JS, peor LCP |
| Hugo | Súper rápido para compilar | DX inferior, plantillas Go raras |
| WordPress | Lo conoce el cliente | Lento, inseguro, plugins, mantenimiento alto |
| SvelteKit | Liviano, moderno | Comunidad menor, menos contratistas disponibles |

### ¿Por qué sitio estático y no dinámico?

- **Velocidad:** HTML pre-generado se sirve en milisegundos.
- **Seguridad:** Sin base de datos, sin PHP, sin admin panel = casi imposible de hackear.
- **Costo:** Cero compute, solo ancho de banda.
- **Escalabilidad:** Aguanta cualquier pico de tráfico.
- **Mantenibilidad:** Cambios en código → build → deploy. Limpio.

Las únicas funciones "dinámicas" que se necesitan (formularios) se resuelven con servicios externos (Web3Forms) o endpoints serverless mínimos.

### ¿Por qué Cloudflare delante del VPS?

- CDN global gratis (más rápido para usuarios fuera de Perú).
- Capa adicional de SSL.
- WAF y mitigación de ataques.
- Oculta la IP real del VPS.
- Caché agresivo reduce tráfico al origen.
- Cero costo (free tier).

### ¿Por qué Nginx y no Apache de Webuzo directamente?

- Nginx es más rápido sirviendo estáticos.
- Configuración más limpia y portable.
- Mejor manejo de HTTP/2 y HTTP/3.
- Nginx puede actuar como reverse proxy del Apache de Webuzo para los otros dominios, sin afectarlos.

### ¿Por qué TypeScript estricto?

- Detecta errores en compile time, no en runtime.
- Mejor autocompletado y refactoring.
- Documentación implícita vía tipos.
- Costo casi cero comparado con beneficio.

### ¿Por qué Tailwind CSS y no CSS modular tradicional?

- Velocidad de desarrollo.
- Build optimizado (purga CSS no usado automáticamente).
- Sistema de diseño consistente vía utilidades.
- Sin nombres de clase repetidos ni colisiones.
- Excelente con Astro components.

### ¿Por qué MDX para el blog?

- Markdown puro para textos.
- Posibilidad de embeber componentes Astro (CTAs, calculadoras, etc.).
- Tipado del frontmatter vía Content Collections.
- Mejor DX que Markdown puro.

## Flujo de Datos

### Renderizado

```
Build time (Astro)
    │
    ├──> Lee MDX/Markdown
    ├──> Lee Content Collections (datos estructurados)
    ├──> Procesa imágenes (WebP/AVIF + responsive)
    ├──> Compila CSS (Tailwind purge)
    ├──> Compila TypeScript
    └──> Genera HTML estático en /dist
              │
              ▼
         Deploy a VPS (Nginx)
              │
              ▼
         Cloudflare cachea
              │
              ▼
         Usuario recibe HTML pre-renderizado
```

### Interacción

```
Usuario llena formulario contacto
    │
    └──> POST a Web3Forms API
              │
              └──> Email a mudanzasexpresoqhapaq@gmail.com

Usuario clic en WhatsApp
    │
    └──> Abre wa.me/51925671052?text=mensaje
              │
              └──> Conversación en WhatsApp del cliente

Usuario hace búsqueda en blog
    │
    └──> Búsqueda en cliente (JS, índice pre-generado)
              │
              └──> Filtra resultados sin llamar al servidor
```

## Estructura de Carpetas Detallada

```
src/
├── components/
│   ├── Button.astro
│   ├── Card.astro
│   ├── Container.astro
│   ├── Section.astro
│   ├── Header.astro
│   ├── Footer.astro
│   ├── WhatsAppButton.astro
│   ├── Hero.astro
│   ├── ServiceCard.astro
│   ├── TestimonialCarousel.astro
│   ├── ContactForm.astro
│   ├── DistrictMap.astro
│   ├── RouteMap.astro
│   ├── StorageCalculator.astro
│   ├── FleetRecommender.astro
│   ├── Breadcrumbs.astro
│   ├── LanguageSwitcher.astro
│   ├── schema/
│   │   ├── SchemaLocalBusiness.astro
│   │   ├── SchemaService.astro
│   │   ├── SchemaFAQ.astro
│   │   ├── SchemaBreadcrumb.astro
│   │   └── SchemaArticle.astro
│   └── blog/
│       ├── ArticleCard.astro
│       ├── TableOfContents.astro
│       ├── ShareButtons.astro
│       └── CTAWhatsApp.astro
├── layouts/
│   ├── BaseLayout.astro
│   ├── ServiceLayout.astro
│   ├── DistrictLayout.astro
│   ├── RouteLayout.astro
│   ├── RouteComingSoonLayout.astro
│   └── BlogLayout.astro
├── pages/
│   ├── index.astro                    → /
│   ├── about.astro                    → /about/
│   ├── contact.astro                  → /contact/
│   ├── projects.astro                 → /projects/
│   ├── preguntas-frecuentes.astro     → /preguntas-frecuentes/
│   ├── 404.astro                      → /404/
│   ├── 500.astro                      → /500/
│   ├── styleguide.astro               → /styleguide/ (interna, noindex)
│   ├── cobertura.astro                → /cobertura/
│   ├── almacenaje-y-custodia-cusco.astro
│   ├── flota-de-camiones-cusco.astro
│   ├── servicio-de-caraga-flete-y-mudanza-cusco.astro
│   ├── ... (todas las URLs preservadas y nuevas)
│   ├── [district].astro              → distritos dinámicos
│   ├── [route].astro                 → rutas dinámicas
│   ├── blog/
│   │   ├── index.astro
│   │   ├── [slug].astro
│   │   ├── categoria/[categoria].astro
│   │   ├── etiqueta/[tag].astro
│   │   └── rss.xml.js
│   └── en/
│       └── ... (espejo en inglés)
├── content/
│   ├── config.ts
│   ├── blog/
│   ├── districts/
│   ├── routes/
│   ├── services/
│   ├── faqs/
│   └── testimonials/
├── i18n/
│   ├── config.ts
│   └── ui.ts
├── styles/
│   ├── global.css
│   ├── tokens.css
│   └── fonts.css
├── lib/
│   ├── seo.ts
│   ├── whatsapp.ts
│   └── format.ts
└── assets/
    └── (imágenes procesadas por Astro)

public/
├── robots.txt
├── favicon.ico
├── og-images/
│   ├── default.jpg
│   └── ...
├── fonts/
│   ├── montserrat-700.woff2
│   ├── noto-sans-400.woff2
│   └── noto-sans-700.woff2
└── wp-content/uploads/2024/05/
    ├── NAN-2.png  (LEGACY - preservar URL)
    ├── EMBALAJE-CUSCO.png
    └── ...
```
