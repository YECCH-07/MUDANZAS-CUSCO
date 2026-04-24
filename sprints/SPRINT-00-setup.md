# SPRINT 00 — Setup Inicial y Arquitectura

**Duración:** 5 días (Semana 1)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** Aprobación del DRU v1.2. Acceso al VPS confirmado. Cuenta GitHub creada.

## Objetivo

Dejar el repositorio funcional y todo el ecosistema técnico listo para empezar a construir páginas en el Sprint 01. Al final de este sprint, cualquier desarrollador debe poder hacer `git clone && npm install && npm run dev` y ver el sitio corriendo en local.

## Entregables

- Repositorio GitHub privado configurado
- Proyecto Astro 4 + TypeScript + Tailwind funcionando en local
- ESLint, Prettier, husky con pre-commit hooks
- Estructura de carpetas creada según `CLAUDE.md`
- Configuración i18n base (español/inglés)
- GitHub Actions workflow inicial (lint + typecheck + build)
- Documentación inicial actualizada

## Tareas

### Tarea 0.1 — Crear repositorio GitHub

```bash
# Crear repositorio privado en github.com/[org]/cuscomudanzas
# Clonar localmente
git clone git@github.com:[org]/cuscomudanzas.git
cd cuscomudanzas
```

**Acceptance:** Repositorio existe, clonado en local, vacío.

### Tarea 0.2 — Inicializar proyecto Astro

```bash
npm create astro@latest . -- --template minimal --typescript strict --install --no-git
```

Cuando pregunte:
- ¿Sobrescribir el directorio? → **Yes** (está vacío salvo `.git`)
- ¿Inicializar git? → **No** (ya está inicializado)

**Acceptance:** `npm run dev` levanta el servidor en `http://localhost:4321` mostrando la página por defecto de Astro.

### Tarea 0.3 — Instalar Tailwind CSS

```bash
npx astro add tailwind
```

Aceptar todos los prompts. Crear `src/styles/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #fb2056;
  --color-primary-dark: #da1c4b;
  --color-dark: #1a1a1a;
  --color-bg: #ffffff;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Noto Sans', system-ui, sans-serif;
  color: var(--color-dark);
  background: var(--color-bg);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Montserrat', system-ui, sans-serif;
}
```

Importarlo en `src/layouts/BaseLayout.astro` (lo crearemos después).

**Acceptance:** Las clases de Tailwind funcionan en cualquier componente Astro.

### Tarea 0.4 — Configurar Tailwind con paleta corporativa

Editar `tailwind.config.mjs`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fb2056',
          dark: '#da1c4b',
        },
        whatsapp: '#25D366',
      },
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1240px',
      },
    },
  },
  plugins: [],
};
```

**Acceptance:** `bg-primary`, `font-heading` y `max-w-container` funcionan.

### Tarea 0.5 — Configurar TypeScript estricto

Editar `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@lib/*": ["src/lib/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

**Acceptance:** `npm run astro check` pasa sin errores. Imports con `@/` funcionan.

### Tarea 0.6 — Instalar y configurar ESLint + Prettier

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-astro eslint-plugin-jsx-a11y \
  prettier prettier-plugin-astro prettier-plugin-tailwindcss
```

Crear `.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },
  ],
};
```

Crear `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

Agregar scripts a `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "lint": "eslint . --ext .ts,.astro",
    "lint:fix": "eslint . --ext .ts,.astro --fix",
    "format": "prettier --write .",
    "typecheck": "astro check",
    "ci": "npm run lint && npm run typecheck && npm run build"
  }
}
```

**Acceptance:** `npm run lint` y `npm run format` ejecutan sin errores en un proyecto vacío.

### Tarea 0.7 — Configurar Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

Editar `.husky/pre-commit`:

```bash
npx lint-staged
```

Agregar a `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,astro}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

**Acceptance:** Al hacer commit, lint-staged corre automáticamente.

### Tarea 0.8 — Crear estructura de carpetas

```bash
mkdir -p src/{components,layouts,pages/en,content,i18n,styles,lib,assets}
mkdir -p src/content/{blog,faqs,services,testimonials}
mkdir -p public/wp-content/uploads/2024/05
mkdir -p server/{nginx,scripts}
mkdir -p docs sprints
```

Mover `CLAUDE.md`, `README.md`, `ROADMAP.md` a la raíz si aún no están. Mover los archivos de sprints a `sprints/`.

**Acceptance:** Estructura coincide con la descrita en `CLAUDE.md`.

### Tarea 0.9 — Configurar i18n base

Crear `src/i18n/config.ts`:

```typescript
export const languages = {
  es: 'Español',
  en: 'English',
} as const;

export const defaultLang = 'es';

export type Lang = keyof typeof languages;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}
```

Crear `src/i18n/ui.ts` con el diccionario base:

```typescript
export const ui = {
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Nosotros',
    'nav.services': 'Servicios',
    'nav.coverage': 'Cobertura',
    'nav.gallery': 'Galería',
    'nav.blog': 'Blog',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contacto',
    'cta.whatsapp': 'Cotizar por WhatsApp',
    'cta.call': 'Llamar ahora',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.coverage': 'Coverage',
    'nav.gallery': 'Gallery',
    'nav.blog': 'Blog',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'cta.whatsapp': 'Quote via WhatsApp',
    'cta.call': 'Call now',
  },
} as const;
```

**Acceptance:** Los archivos compilan sin errores TypeScript.

### Tarea 0.10 — Configurar Astro

Editar `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cuscomudanzas.com',
  trailingSlash: 'always',
  build: {
    format: 'directory', // genera /pagina/index.html
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false, // español sin prefijo, inglés en /en/
    },
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-PE', en: 'en-US' },
      },
    }),
  ],
});
```

```bash
npx astro add sitemap
```

**Acceptance:** `npm run build` genera `dist/` con `index.html`, `sitemap-index.xml`.

### Tarea 0.11 — Crear .gitignore y .env.example

`.gitignore`:

```
node_modules/
dist/
.astro/
.env
.env.*.local
.DS_Store
*.log
.vscode/settings.json
```

`.env.example`:

```
# Datos de contacto
PUBLIC_PHONE=925671052
PUBLIC_WHATSAPP=51925671052
PUBLIC_EMAIL=mudanzasexpresoqhapaq@gmail.com

# Analytics
PUBLIC_GA4_ID=G-XXXXXXXXXX
PUBLIC_META_PIXEL_ID=538047728714313

# Forms (Web3Forms o equivalente)
WEB3FORMS_ACCESS_KEY=

# Cloudflare (opcional, si se usa API)
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
```

**Acceptance:** `.env` NO se commitea. `.env.example` sí.

### Tarea 0.12 — GitHub Actions workflow inicial

Crear `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build
```

**Acceptance:** Push a `develop` ejecuta el workflow y pasa en verde.

### Tarea 0.13 — Documentación inicial

Verificar que existen en la raíz:
- [ ] `CLAUDE.md` (memoria del proyecto)
- [ ] `README.md` (quick start)
- [ ] `ROADMAP.md` (plan de sprints)

Crear `docs/COMMANDS.md` con cheatsheet de comandos frecuentes (ver SPRINT-00 anexo).

**Acceptance:** Documentación legible y completa.

### Tarea 0.14 — Primer commit y push

```bash
git add .
git commit -m "chore: setup inicial del proyecto Astro + Tailwind + TypeScript"
git push origin main
```

**Acceptance:** Commit en GitHub, CI corre y pasa.

## Criterios de Aceptación del Sprint

Para considerar el SPRINT-00 completado, TODAS estas condiciones deben cumplirse:

- [ ] `npm install` instala sin errores
- [ ] `npm run dev` levanta servidor en `http://localhost:4321`
- [ ] `npm run build` produce carpeta `dist/`
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run typecheck` pasa sin errores
- [ ] CI de GitHub Actions pasa en verde
- [ ] Pre-commit hook funciona (probar con un commit de prueba)
- [ ] Estructura de carpetas coincide con `CLAUDE.md`
- [ ] i18n base configurado (sin contenido aún)
- [ ] Sitemap se genera al hacer build
- [ ] Tailwind funciona con paleta corporativa custom

## Verificación Final

```bash
# Comando de verificación completa
npm run ci
# Si pasa todo → SPRINT-00 completado

# Marcar en ROADMAP.md
# SPRINT-00 → ✅ Completado
```

## Bloqueos Comunes y Solución

| Problema | Solución |
|----------|----------|
| `npm create astro` falla | Verificar Node.js >= 20: `node -v` |
| Tailwind no funciona | Verificar que `applyBaseStyles: false` y CSS importado en layout |
| TypeScript con errores en .astro | Reiniciar editor, asegurar `astro check` instalado |
| CI falla en GitHub | Revisar logs, generalmente es por dependencias faltantes en `package-lock.json` |

## Siguiente Sprint

Una vez completado: **[SPRINT-01 — Sistema de Diseño](SPRINT-01-design-system.md)**
