# SPRINT 08 — Internacionalización al Inglés

**Duración:** 5 días (Semana 10)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-07 completado.

## Objetivo

Crear la versión completa en inglés de las páginas core para captar el segmento de turistas y residentes extranjeros (expats) en Cusco. Configurar correctamente hreflang, sitemaps por idioma y mensajes WhatsApp en inglés.

## URLs a crear (versión inglés)

Versión inglés con prefijo `/en/`:

- `/en/` — Homepage
- `/en/services/` — Services hub
- `/en/local-moving-cusco/`
- `/en/intercity-moving/`
- `/en/office-moving-cusco/`
- `/en/storage-and-custody-cusco/`
- `/en/our-fleet/`
- `/en/about/`
- `/en/contact/`
- `/en/coverage/`
- `/en/faq/`

**Nota:** No traducir el blog ni todas las landings de distritos/rutas en esta fase. Se evalúa según demanda real.

## Tareas

### Tarea 8.1 — Expandir diccionario i18n

`src/i18n/ui.ts` con TODAS las cadenas del sitio:

```typescript
export const ui = {
  es: {
    // Navegación
    'nav.home': 'Inicio',
    'nav.about': 'Nosotros',
    'nav.services': 'Servicios',
    'nav.coverage': 'Cobertura',
    'nav.gallery': 'Galería',
    'nav.blog': 'Blog',
    'nav.faq': 'Preguntas Frecuentes',
    'nav.contact': 'Contacto',

    // CTAs
    'cta.whatsapp': 'Cotizar por WhatsApp',
    'cta.call': 'Llamar ahora',
    'cta.email': 'Enviar email',
    'cta.viewMore': 'Ver más',
    'cta.viewServices': 'Ver servicios',

    // Hero homepage
    'home.hero.title': 'Mudanzas Profesionales en Cusco',
    'home.hero.subtitle': 'Transporte seguro y confiable. Cobertura local y a las provincias del sur.',

    // ... (cientos de cadenas)
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.services': 'Services',
    'nav.coverage': 'Coverage',
    'nav.gallery': 'Gallery',
    'nav.blog': 'Blog',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',

    // CTAs
    'cta.whatsapp': 'Quote via WhatsApp',
    'cta.call': 'Call now',
    'cta.email': 'Send email',
    'cta.viewMore': 'View more',
    'cta.viewServices': 'View services',

    // Hero homepage
    'home.hero.title': 'Professional Moving Services in Cusco',
    'home.hero.subtitle': 'Safe and reliable transport. Local and inter-provincial coverage.',

    // ... (cientos de cadenas)
  },
} as const;

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof lang]): string {
    return ui[lang][key] || ui.es[key] || String(key);
  };
}
```

### Tarea 8.2 — Crear páginas en inglés

Para cada página core, crear su contraparte en `src/pages/en/`:

```
src/pages/
├── index.astro              → /
├── en/
│   ├── index.astro          → /en/
│   ├── about.astro          → /en/about/
│   ├── contact.astro        → /en/contact/
│   ├── services.astro       → /en/services/
│   ├── local-moving-cusco.astro
│   ├── intercity-moving.astro
│   ├── office-moving-cusco.astro
│   ├── storage-and-custody-cusco.astro
│   ├── our-fleet.astro
│   ├── coverage.astro
│   └── faq.astro
```

### Tarea 8.3 — Implementar hreflang en `BaseLayout`

```astro
---
const lang = getLangFromUrl(Astro.url);
const path = Astro.url.pathname;

// Mapa de URLs equivalentes ES → EN
const urlMap = {
  '/': '/en/',
  '/about/': '/en/about/',
  '/contact/': '/en/contact/',
  '/servicio-de-caraga-flete-y-mudanza-cusco/': '/en/services/',
  '/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/': '/en/local-moving-cusco/',
  '/mudanza-provincia/': '/en/intercity-moving/',
  '/mudanzas-de-o/': '/en/office-moving-cusco/',
  '/almacenaje-y-custodia-cusco/': '/en/storage-and-custody-cusco/',
  '/flota-de-camiones-cusco/': '/en/our-fleet/',
  '/preguntas-frecuentes/': '/en/faq/',
};

function getAlternateUrl(path: string, targetLang: 'es' | 'en'): string | null {
  if (targetLang === 'en' && urlMap[path]) return urlMap[path];
  if (targetLang === 'es') {
    const reverseEntry = Object.entries(urlMap).find(([_, en]) => en === path);
    if (reverseEntry) return reverseEntry[0];
  }
  return null;
}

const alternateEs = getAlternateUrl(path, 'es') || (lang === 'es' ? path : null);
const alternateEn = getAlternateUrl(path, 'en') || (lang === 'en' ? path : null);
---

{alternateEs && <link rel="alternate" hreflang="es" href={`https://cuscomudanzas.com${alternateEs}`} />}
{alternateEn && <link rel="alternate" hreflang="en" href={`https://cuscomudanzas.com${alternateEn}`} />}
{alternateEs && <link rel="alternate" hreflang="x-default" href={`https://cuscomudanzas.com${alternateEs}`} />}
```

### Tarea 8.4 — Selector de idioma en Header

Componente `<LanguageSwitcher>`:

```astro
---
const currentLang = getLangFromUrl(Astro.url);
const currentPath = Astro.url.pathname;
const targetLang = currentLang === 'es' ? 'en' : 'es';
const targetPath = getAlternateUrl(currentPath, targetLang) || (targetLang === 'en' ? '/en/' : '/');
---

<a href={targetPath} class="lang-switcher" aria-label={`Cambiar idioma a ${targetLang === 'es' ? 'Español' : 'English'}`}>
  {targetLang === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}
</a>
```

### Tarea 8.5 — Mensajes WhatsApp localizados

El componente `<WhatsAppButton>` debe leer el idioma actual y enviar mensaje correspondiente.

```typescript
const messages = {
  es: 'Hola, vi su web y necesito información sobre sus servicios de mudanza',
  en: 'Hi, I saw your website and need information about your moving services',
};
```

### Tarea 8.6 — Sitemap separado por idioma

Astro con integración `@astrojs/sitemap` ya configurada en SPRINT-00 lo hace automáticamente con `i18n.locales`.

Verificar que `/sitemap-index.xml` lista ambos sitemaps (ES y EN).

### Tarea 8.7 — Schema.org localizado

En cada página inglés, el JSON-LD debe usar:
- `inLanguage: "en"`
- Descripciones en inglés

### Tarea 8.8 — Banner sugerente de idioma (opcional)

Detectar `navigator.language` del cliente y, si comienza con `en`, mostrar banner discreto: "View this page in English →".

NO redirigir automáticamente (mala práctica SEO).

### Tarea 8.9 — Página `/en/coverage/`

Listado de todas las rutas y distritos atendidos, con descripciones en inglés. Útil para expats que no conocen la geografía local.

### Tarea 8.10 — Traducción profesional

NO usar Google Translate. Contratar traducción humana profesional ES→EN para:
- Todas las cadenas del diccionario
- Contenido de las 11 páginas en inglés
- Meta titles y descriptions
- Mensajes WhatsApp

Word count estimado: ~8,000-12,000 palabras a traducir.

## Criterios de Aceptación

- [ ] 11 páginas en inglés publicadas
- [ ] Hreflang correcto en cada par ES/EN
- [ ] Selector de idioma funcional, mantiene equivalencia
- [ ] Sitemap separado por idioma
- [ ] Schema.org localizado
- [ ] Mensajes WhatsApp en inglés
- [ ] Validación con hreflang Tags Testing Tool de Merkle
- [ ] Lighthouse 95+ en páginas inglés
- [ ] Traducción aprobada (no Google Translate)

## Siguiente Sprint

**[SPRINT-09 — SEO Técnico Completo](SPRINT-09-seo-technical.md)**
