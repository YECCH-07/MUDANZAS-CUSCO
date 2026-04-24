# SPRINT 01 — Sistema de Diseño y Componentes Base

**Duración:** 5 días (Semana 2)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-00 completado.

## Objetivo

Construir el sistema de diseño y los componentes reutilizables que serán la base de TODAS las páginas del sitio. Al final del sprint, debe existir una página `/styleguide/` interna que muestre todos los componentes y permita validarlos visualmente.

## Entregables

- Tokens de diseño definidos (colores, tipografías, espaciados, sombras)
- Componentes base: Button, Card, Container, Section, Heading
- Header completo con navegación responsive y selector de idioma
- Footer completo con 4 columnas
- WhatsApp Floating Button
- BaseLayout que envuelve todas las páginas
- Página `/styleguide/` interna con todos los componentes

## Tareas

### Tarea 1.1 — Definir tokens de diseño

Crear `src/styles/tokens.css`:

```css
:root {
  /* Colores corporativos */
  --color-primary: #fb2056;
  --color-primary-dark: #da1c4b;
  --color-primary-light: #ff6b8c;

  /* Neutros */
  --color-dark: #1a1a1a;
  --color-gray-900: #191919;
  --color-gray-700: #404040;
  --color-gray-500: #737373;
  --color-gray-300: #d1d5db;
  --color-gray-100: #f5f5f5;
  --color-white: #ffffff;

  /* Estado */
  --color-success: #2e7d32;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-whatsapp: #25d366;

  /* Tipografía */
  --font-heading: 'Montserrat', system-ui, sans-serif;
  --font-body: 'Noto Sans', system-ui, sans-serif;

  /* Espaciado base */
  --space-section: clamp(3rem, 8vw, 6rem);
  --space-container: clamp(1rem, 4vw, 2rem);

  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);

  /* Bordes redondeados */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-pill: 999px;

  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

**Acceptance:** Variables CSS disponibles globalmente.

### Tarea 1.2 — Componente `<Container>`

Crear `src/components/Container.astro`:

```astro
---
interface Props {
  as?: string;
  class?: string;
  size?: 'narrow' | 'default' | 'wide' | 'full';
}

const { as: Tag = 'div', class: className = '', size = 'default' } = Astro.props;

const sizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-container',
  wide: 'max-w-7xl',
  full: 'max-w-full',
};
---

<Tag class={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
  <slot />
</Tag>
```

**Acceptance:** `<Container>` centra contenido y aplica padding responsive.

### Tarea 1.3 — Componente `<Section>`

Crear `src/components/Section.astro`:

```astro
---
interface Props {
  class?: string;
  background?: 'white' | 'gray' | 'primary' | 'dark';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const { class: className = '', background = 'white', spacing = 'lg' } = Astro.props;

const backgrounds = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  primary: 'bg-primary text-white',
  dark: 'bg-gray-900 text-white',
};

const spacings = {
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
};
---

<section class={`${backgrounds[background]} ${spacings[spacing]} ${className}`}>
  <slot />
</section>
```

### Tarea 1.4 — Componente `<Button>`

Crear `src/components/Button.astro`:

```astro
---
interface Props {
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  external?: boolean;
  class?: string;
  ariaLabel?: string;
}

const {
  href,
  variant = 'primary',
  size = 'md',
  external = false,
  class: className = '',
  ariaLabel,
} = Astro.props;

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-gray-900 text-white hover:bg-gray-700',
  outline: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
  whatsapp: 'bg-whatsapp text-white hover:bg-green-600',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const classes = `inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors ${variants[variant]} ${sizes[size]} ${className}`;

const Tag = href ? 'a' : 'button';
const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
---

<Tag href={href} class={classes} aria-label={ariaLabel} {...externalProps}>
  <slot />
</Tag>
```

**Acceptance:** Botón en 4 variantes y 3 tamaños funciona como link o button.

### Tarea 1.5 — Componente `<WhatsAppButton>` (CTA principal)

Crear `src/components/WhatsAppButton.astro`:

```astro
---
interface Props {
  message?: string;
  variant?: 'floating' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const {
  message = 'Hola, vi su web y necesito información sobre sus servicios de mudanza',
  variant = 'inline',
  size = 'md',
  label = 'Cotizar por WhatsApp',
} = Astro.props;

const phone = import.meta.env.PUBLIC_WHATSAPP || '51925671052';
const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
---

{
  variant === 'floating' ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-110 animate-pulse-slow"
      aria-label={label}
      data-track="whatsapp_floating_click"
    >
      <svg class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  ) : (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class={`inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp font-bold text-white transition-colors hover:bg-green-600 ${
        size === 'sm' ? 'px-4 py-2 text-sm' : size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3'
      }`}
      data-track="whatsapp_inline_click"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
      </svg>
      {label}
    </a>
  )
}

<style>
  @keyframes pulse-slow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
    50% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
  }
  .animate-pulse-slow {
    animation: pulse-slow 3s infinite;
  }
</style>
```

**Acceptance:** Botón de WhatsApp con dos variantes (floating + inline), abre WhatsApp con mensaje pre-armado.

### Tarea 1.6 — Componente `<Header>`

Crear `src/components/Header.astro`. Debe incluir:
- Logo (link a `/`)
- Menú principal con dropdowns para "Servicios" y "Cobertura"
- Selector de idioma (banderas + texto)
- Botón WhatsApp en header
- Versión móvil con menú hamburguesa
- Sticky en scroll

(Implementación detallada — ver `docs/components/HEADER.md` para plantilla completa)

**Acceptance:** Header responsive funciona en móvil y escritorio.

### Tarea 1.7 — Componente `<Footer>`

Crear `src/components/Footer.astro` con 4 columnas:
1. Acerca de (logo + descripción + redes sociales)
2. Servicios principales
3. Rutas que cubrimos
4. Contacto (teléfono click-to-call, email, dirección)

Más línea inferior con copyright y links legales.

**Acceptance:** Footer responsive con todos los datos del CLAUDE.md.

### Tarea 1.8 — `<BaseLayout>`

Crear `src/layouts/BaseLayout.astro`:

```astro
---
import '@/styles/global.css';
import '@/styles/tokens.css';
import Header from '@components/Header.astro';
import Footer from '@components/Footer.astro';
import WhatsAppButton from '@components/WhatsAppButton.astro';
import { getLangFromUrl } from '@/i18n/config';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  whatsappMessage?: string;
}

const {
  title,
  description,
  canonical = Astro.url.href,
  ogImage = '/og-default.jpg',
  whatsappMessage,
} = Astro.props;

const lang = getLangFromUrl(Astro.url);
const siteUrl = 'https://cuscomudanzas.com';
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/png" href="/wp-content/uploads/2024/05/NAN-2-120x120.png" />

    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={`${siteUrl}${ogImage}`} />
    <meta property="og:locale" content={lang === 'es' ? 'es_PE' : 'en_US'} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

    <slot name="head" />
  </head>
  <body class="flex min-h-screen flex-col">
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
      Saltar al contenido
    </a>

    <Header />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <Footer />

    <WhatsAppButton variant="floating" message={whatsappMessage} />
  </body>
</html>
```

**Acceptance:** Layout funcional con SEO básico y todos los componentes.

### Tarea 1.9 — Página `/styleguide/` (interna)

Crear `src/pages/styleguide.astro` que muestre TODOS los componentes con todas sus variantes para revisión visual. Incluir nota: "Esta página es interna y NO debe estar indexada".

Agregar `<meta name="robots" content="noindex, nofollow" />` en su `<head>`.

**Acceptance:** Visitar `/styleguide/` muestra todos los botones, cards, headers, etc.

### Tarea 1.10 — Cargar fuentes auto-hospedadas

Descargar Montserrat (700) y Noto Sans (400, 700) en formato WOFF2.

Colocar en `public/fonts/`.

Crear `src/styles/fonts.css`:

```css
@font-face {
  font-family: 'Montserrat';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/montserrat-700.woff2') format('woff2');
}

@font-face {
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/noto-sans-400.woff2') format('woff2');
}

@font-face {
  font-family: 'Noto Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/noto-sans-700.woff2') format('woff2');
}
```

Importar en `BaseLayout.astro`. Agregar `<link rel="preload">` para las fuentes críticas.

**Acceptance:** Fuentes cargan localmente, sin llamadas a Google Fonts.

## Criterios de Aceptación del Sprint

- [ ] Página `/styleguide/` muestra todos los componentes
- [ ] Header funciona en móvil (menú hamburguesa) y desktop
- [ ] Footer responsive con datos correctos
- [ ] WhatsApp button flotante con animación de pulso
- [ ] Todas las fuentes cargan localmente
- [ ] Lighthouse Performance ≥ 95 en `/styleguide/`
- [ ] Sin errores de TypeScript
- [ ] Sin errores de ESLint
- [ ] Commit y push hecho

## Verificación Final

```bash
npm run ci
npm run dev
# Visitar http://localhost:4321/styleguide y revisar todos los componentes
```

## Siguiente Sprint

**[SPRINT-02 — Páginas Core](SPRINT-02-core-pages.md)**
