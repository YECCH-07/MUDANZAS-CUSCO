# cuscomudanzas.com — Proyecto de Migración

Migración de WordPress + Astra + Elementor a stack moderno (Astro 4 + TypeScript + Tailwind), conservando 100% del posicionamiento SEO actual.

## Para Claude Code

Si estás iniciando una sesión en este repositorio, el archivo `CLAUDE.md` se carga automáticamente con todo el contexto del proyecto. Léelo primero.

## Quick Start

```bash
# 1. Clonar el repositorio
git clone git@github.com:[org]/cuscomudanzas.git
cd cuscomudanzas

# 2. Instalar Node.js 20 LTS si no lo tienes
nvm install 20 && nvm use 20

# 3. Instalar dependencias
npm install

# 4. Levantar servidor de desarrollo
npm run dev
# → http://localhost:4321

# 5. Build de producción
npm run build
# → /dist con archivos estáticos listos para servir
```

## Estructura

```
cuscomudanzas/
├── CLAUDE.md          # Contexto del proyecto (leer primero)
├── README.md          # Este archivo
├── ROADMAP.md         # Plan de 13 sprints
├── sprints/           # Documentación de cada sprint
│   ├── SPRINT-00-setup.md
│   ├── SPRINT-01-design-system.md
│   └── ...
├── docs/              # Documentación técnica
│   ├── ARCHITECTURE.md
│   ├── SEO-PRESERVATION.md
│   ├── URLS-MAP.md
│   └── COMMANDS.md
├── public/            # Assets estáticos
├── src/               # Código fuente
└── server/            # Configuración del servidor
```

## Cómo Trabajar con los Sprints

### Modo Claude Code (recomendado)

```bash
# Abrir Claude Code en el directorio del proyecto
claude

# Pedirle que ejecute el siguiente sprint
> Ejecuta el SPRINT-00 según el archivo sprints/SPRINT-00-setup.md
```

Claude Code leerá `CLAUDE.md`, luego abrirá el sprint, y ejecutará las tareas paso a paso. Cada sprint es autónomo y autoexplicativo.

### Modo manual (humano)

1. Abre `ROADMAP.md` y revisa el orden de los sprints.
2. Abre el sprint actual: `sprints/SPRINT-XX-nombre.md`.
3. Sigue las tareas en orden. Cada tarea tiene:
   - Comandos exactos a ejecutar
   - Archivos a crear/modificar
   - Criterios de aceptación
4. Al terminar, marca el sprint como completado en el ROADMAP.

## Sprints (resumen)

| # | Sprint | Duración | Objetivo principal |
|---|--------|----------|--------------------|
| 0 | Setup inicial | 5 días | Repo, Astro, Tailwind, ESLint, CI/CD |
| 1 | Sistema de diseño | 5 días | Tokens, componentes base, Header, Footer |
| 2 | Páginas core | 10 días | Home, Nosotros, Contacto, 404 |
| 3 | Servicios | 5 días | 7 páginas de servicios |
| 4 | Almacenaje y Flota | 5 días | Páginas + calculadoras |
| 5 | Distritos | 5 días | 8 landings de distritos de Cusco |
| 6 | Rutas inter-provinciales | 5 días | 9 activas + 4 "próximamente" |
| 7 | Blog SEO | 5 días | Sistema de blog + 8 artículos |
| 8 | Inglés (i18n) | 5 días | Traducir páginas core |
| 9 | SEO técnico | 5 días | Schema, sitemap, OG, hreflang |
| 10 | VPS y deploy | 5 días | Nginx, SSL, Cloudflare, GitHub Actions |
| 11 | QA y pre-launch | 5 días | Auditoría completa, testing |
| 12 | Lanzamiento | 5 días | Día D + monitoreo 72h |

**Total:** 13 semanas (65 días hábiles).

## Documento Maestro

El **Documento de Requerimientos de Usuario (DRU v1.2)** contiene la especificación completa: 73 páginas con personas, journeys, requerimientos funcionales y no funcionales, estrategia SEO, etc. Se entrega como Word separado del repositorio. Este repo es la implementación; el DRU es el "qué" y el "por qué".

## Reglas de Oro

1. **No tocar URLs preservadas** sin redirección 301 en su lugar.
2. **No reducir contenido textual** del WordPress actual.
3. **No usar `any` en TypeScript** sin justificar.
4. **No commitear secrets** (`.env` está en `.gitignore`).
5. **No deployar a producción** sin pasar por staging y QA.
6. **WhatsApp es el CTA principal** en cada página.

## Soporte

- Propietario: YEISON (`184193@unsaac.edu.pe`)
- Contacto comercial: 925 671 052 / mudanzasexpresoqhapaq@gmail.com
