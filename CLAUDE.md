# CLAUDE.md — Memoria del Proyecto cuscomudanzas.com

> Este archivo se carga automáticamente al iniciar Claude Code en este repositorio. Contiene el contexto completo del proyecto, convenciones, restricciones críticas y reglas de negocio. Léelo siempre antes de empezar cualquier trabajo.

## Contexto del Proyecto

**Empresa:** Expresos Ñan
**Sitio:** https://cuscomudanzas.com
**Estado:** Migración desde WordPress + Astra + Elementor a stack moderno (Astro 4)
**Propietario:** YEISON
**Hosting:** VPS AlmaLinux 9.7 con Webuzo Premium en `vps1.cuscomudanzas.com` (IP `50.31.190.36`)

## Reglas de Negocio Críticas

### Servicios que ofrecemos

1. **Mudanzas locales** dentro de Cusco metropolitano y distritos cercanos (hasta 1 h): Wanchaq, San Sebastián, San Jerónimo, Santiago, Cusco Centro, Saylla, Poroy, Ccorca.
2. **Mudanzas al Valle Sagrado y alrededores** (1-4 h, servicio activo, 22 localidades):
   - **1 a 2 h:** Pisac, Calca, Urubamba, Chinchero, Anta, Coya.
   - **2 a 3 h:** Ollantaytambo, Yucay, Maras, Mollepata, Limatambo, Huarocondo, Zurite.
   - **3 a 4 h:** Lares, Yanatile, Machupicchu (Aguas Calientes), Oropesa, Urcos, Andahuaylillas, Lucre, Paruro, Paucartambo.
3. **Mudanzas inter-provinciales largas** (5-12 h, rutas reales actualmente operando):
   - Cusco ↔ Sicuani (Canchis, Cusco)
   - Cusco ↔ Abancay (capital de Apurímac)
   - Cusco ↔ Challhuahuacho (Cotabambas, Apurímac)
   - Cusco ↔ Tambobamba (Cotabambas, Apurímac)
   - Cusco ↔ Haquira (Cotabambas, Apurímac)
   - Cusco ↔ Mara (Cotabambas, Apurímac)
   - Cusco ↔ Coyllurqui (Cotabambas, Apurímac)
   - Cusco ↔ Colquemarca (Chumbivilcas, Cusco)
   - Cusco ↔ Capacmarca (Chumbivilcas, Cusco)
4. **Mudanzas de oficina** (servicio empresarial).
5. **Servicio de embalaje y empaque** profesional.
6. **Flete y carga** general.
7. **Armado y desarmado de muebles**.
8. **Almacenaje y custodia** de pertenencias por días, meses o años (servicio diferenciador).
9. Mudanzas **para estudiantes** UNSAAC.

> **Nota de fuente única:** la lista estructurada de localidades por zona (con provincias y regiones) vive en [`src/lib/coverage.ts`](src/lib/coverage.ts). Si se agrega o retira una localidad, actualizar ahí y el resto del sitio lo refleja automáticamente.

### Rutas "Próximamente" (NO operativas, solo captación de leads)

- Cusco ↔ Arequipa (BIDIRECCIONAL — dos landings: una desde Cusco, otra desde Arequipa)
- Cusco → Juliaca
- Cusco → Puno

### Rutas que NO atendemos

- Cusco ↔ Lima (NO ofrecer este servicio en ningún lugar del sitio)
- Cusco ↔ Espinar, Quillabamba, u otras no listadas arriba

### Flota de unidades

Unidades de **1 tonelada**, **2 toneladas** y **4 toneladas**.

### Datos de contacto

- Teléfono / WhatsApp: **925 671 052**
- Email: **mudanzasexpresoqhapaq@gmail.com**
- Dirección: René de la Molina, Cusco 08004
- Facebook: facebook.com/ExpresoQhapaq, facebook.com/MudanzaCusco1
- Instagram: instagram.com/cuscomudanzas1
- TikTok: tiktok.com/@MudanzasCusco11

## Stack Técnico

| Capa        | Tecnología                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| Framework   | **Astro 6.x**                                                                                                          |
| Runtime     | **Node.js 24 LTS** (≥22.12 requerido por Astro 6)                                                                      |
| Lenguaje    | TypeScript 5.x (strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`)                                    |
| Estilos     | **Tailwind CSS 4.x** (Vite plugin; tokens en `@theme` dentro del CSS, sin `tailwind.config.js`)                        |
| Contenido   | MDX + Astro Content Collections                                                                                        |
| i18n        | Integración nativa de Astro (`i18n` en `astro.config.mjs`) + diccionario propio en `src/i18n/ui.ts`                    |
| Imágenes    | `astro:assets` + Sharp (WebP/AVIF)                                                                                     |
| Lint        | **ESLint 9 flat config** (`eslint.config.js`) + `typescript-eslint` + `eslint-plugin-astro` + `eslint-plugin-jsx-a11y` |
| Formato     | Prettier 3 + `prettier-plugin-astro` + `prettier-plugin-tailwindcss`                                                   |
| Pre-commit  | Husky 9 + lint-staged 15                                                                                               |
| Hosting     | VPS AlmaLinux 9.7 + Nginx 1.24+ (delante del Apache de Webuzo)                                                         |
| SSL         | Let's Encrypt + Certbot                                                                                                |
| CDN         | Cloudflare (free tier)                                                                                                 |
| CI/CD       | GitHub Actions                                                                                                         |
| Repositorio | [YECCH-07/MUDANZAS-CUSCO](https://github.com/YECCH-07/MUDANZAS-CUSCO) (privado)                                        |
| Backups     | rsync + Backblaze B2                                                                                                   |
| Monitoreo   | UptimeRobot                                                                                                            |
| Analítica   | Google Analytics 4 + Meta Pixel (`538047728714313`)                                                                    |

> **Nota sobre versiones:** el plan original (DRU) asumía Astro 4 + Tailwind 3. Al iniciar SPRINT-00 en abril 2026, las versiones LTS/estables actuales son Astro 6 y Tailwind 4. El stack se actualizó sin cambiar el alcance funcional; las reglas SEO, URLs preservadas, i18n y decisiones de arquitectura siguen idénticas.

## Restricciones Absolutas (NO NEGOCIABLES)

### SEO — Conservación del posicionamiento

1. **NUNCA cambiar las URLs preservadas** del WordPress actual:
   - `/`
   - `/about/`
   - `/contact/`
   - `/projects/`
   - `/preguntas-frecuentes/`
   - `/servicio-de-caraga-flete-y-mudanza-cusco/`
   - `/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/`
   - `/mudanza-provincia/`
   - `/mudanzas-de-o/`

2. **NUNCA cambiar los meta titles** sin aprobación explícita del propietario.
3. **NUNCA reducir el contenido textual** existente (solo ampliar y mejorar).
4. **SIEMPRE configurar redirecciones 301** para cualquier URL nueva o cambiada.
5. **SIEMPRE preservar las URLs de imágenes** bajo `/wp-content/uploads/...` (ej: `NAN-2.png`, `EMBALAJE-CUSCO.png`, etc.).
6. **SIEMPRE incluir hreflang** entre versiones ES y EN.
7. **NUNCA bloquear bots** legítimos en `robots.txt`.
8. **NUNCA hacer push a `main`** sin haber pasado QA en `staging`.

### Convenciones de URL

- Solo minúsculas
- Separación con guion medio `-` (nunca `_`)
- Trailing slash obligatorio: `/mudanzas-wanchaq/` ✅, `/mudanzas-wanchaq` ❌
- Sin acentos, sin ñ (en URLs usar `n`)
- Versión inglesa con prefijo `/en/`

### Convenciones de Código

- TypeScript estricto, sin `any` salvo justificado.
- Componentes Astro nombrados en `PascalCase.astro`.
- Archivos de páginas en `kebab-case.astro`.
- Funciones helpers en `camelCase`.
- Constantes en `SCREAMING_SNAKE_CASE`.
- Componentes pequeños, una responsabilidad cada uno.
- Cero `console.log` en producción.
- Comentarios en español (es el idioma del cliente y del equipo).
- Commits en español, formato Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## Estructura del Repositorio

```
cuscomudanzas/
├── CLAUDE.md                  # Este archivo (memoria del proyecto)
├── README.md                  # Quick start del repo
├── ROADMAP.md                 # Vista general de los 13 sprints
├── package.json
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD a producción
├── public/                    # Assets estáticos sin procesar
│   ├── robots.txt
│   ├── favicon.ico
│   └── wp-content/uploads/    # Imágenes legacy (preservar URLs)
├── src/
│   ├── components/            # Componentes Astro reutilizables
│   ├── layouts/               # BaseLayout, BlogLayout, etc.
│   ├── pages/                 # Rutas (es/) y (en/)
│   ├── content/               # Content Collections (blog, faqs, etc.)
│   ├── i18n/                  # Diccionarios de traducción
│   ├── styles/                # CSS global
│   ├── lib/                   # Utilidades TS
│   └── assets/                # Imágenes procesadas por Astro
├── sprints/                   # Documentación de cada sprint
├── docs/                      # Documentación técnica adicional
└── server/
    ├── nginx/                 # Configuración Nginx
    └── scripts/               # Scripts de despliegue
```

## Personas Objetivo (Audiencia)

1. **María (Familia)** — 38 años, busca mudanza familiar local. 45% del tráfico esperado.
2. **Carlos (Empresa)** — 45 años, gerente. Necesita mudanzas de oficina con factura. 20% tráfico.
3. **Diego (Estudiante UNSAAC)** — 21 años, mudanzas pequeñas y económicas. 20% tráfico.
4. **Rosa (Comerciante)** — 52 años, fletes recurrentes a Sicuani/Abancay/Apurímac. 10% tráfico.
5. **Sarah (Expat)** — 34 años, expat en Cusco, necesita servicio en inglés. 5% tráfico.

## CTA Principal

**WhatsApp** (canal de conversión número uno). Cada página debe tener:

- Botón flotante persistente esquina inferior derecha (verde `#25D366`).
- Mensaje pre-armado contextual a la página.
- Tracking como evento de conversión en GA4.

## Identidad Visual

- Color primario: `#D72638` (carmesí confianza, actualizado 2026-04-24)
- Color secundario: `#A61D2B` (carmesí oscuro, para hovers)
- Color acento: `#FF6B7A` (carmesí claro, para badges y acentos sutiles)
- Color neutro oscuro: `#0F0F0F` (casi negro, combina con logo)
- Tipografía: Montserrat (titulares) + Noto Sans (cuerpo) — preservar del actual
- Logo: variantes en `/wp-content/uploads/2024/05/NAN-2.png`

## Comandos Rápidos

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor desarrollo en :4321
npm run build        # Build estático en /dist
npm run preview      # Servir build localmente
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Ejecutar tests
```

## Flujo de Trabajo con Sprints

1. Lee el sprint actual en `sprints/SPRINT-XX-nombre.md`.
2. Sigue las tareas en orden.
3. Cada tarea tiene comandos específicos y archivos a crear.
4. Marca cada tarea como completada.
5. Verifica criterios de aceptación al final del sprint.
6. Commit y push al cerrar el sprint.

## Cuando Tengas Dudas

- Consulta `docs/ARCHITECTURE.md` para decisiones arquitectónicas.
- Consulta `docs/SEO-PRESERVATION.md` para reglas SEO.
- Consulta `docs/URLS-MAP.md` para el mapa completo de URLs.
- Consulta `docs/COMMANDS.md` para comandos de uso frecuente.
- Si no encuentras respuesta, **pregunta al propietario antes de inventar**.

## Lista de Verificación Universal (Definition of Done)

Cualquier página/componente terminado debe cumplir:

- [ ] HTML semántico válido
- [ ] Accesibilidad WCAG 2.1 AA (contraste, ARIA labels, keyboard nav)
- [ ] Responsive desde 320px hasta 1920px
- [ ] Lighthouse Performance ≥ 95
- [ ] Lighthouse SEO = 100
- [ ] Schema.org JSON-LD válido (validado en Rich Results Test)
- [ ] Open Graph + Twitter Cards
- [ ] Imágenes optimizadas (WebP/AVIF) con `alt` descriptivo
- [ ] Lazy loading en imágenes fuera de viewport
- [ ] Sin enlaces rotos
- [ ] Versión en inglés (si aplica) con hreflang correcto
- [ ] CTAs WhatsApp con mensaje contextual
- [ ] Probado en Chrome, Safari, Firefox móvil

## Documento de Requerimientos

El documento maestro de requerimientos (DRU v1.2) define toda la especificación funcional, no funcional, técnica y de negocio. Está disponible en formato Word fuera del repositorio. Este `CLAUDE.md` resume lo crítico; para detalle profundo siempre consultar el DRU.
