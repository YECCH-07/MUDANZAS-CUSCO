# ROADMAP — Plan de 13 Sprints

> Este es el plan maestro de ejecución. Cada sprint dura 1 semana (5 días hábiles) y produce entregables concretos verificables. Los sprints se ejecutan en orden: cada uno depende del anterior.

## Visión General

**Inicio:** Semana 1 (después de aprobación del DRU)
**Fin:** Semana 13 (lanzamiento en producción)
**Post-lanzamiento:** Semanas 14-26 (monitoreo intensivo, no incluido como sprints)

```
Semana  1   2   3   4   5   6   7   8   9  10  11  12  13
        ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ───
       [S0][S1][   S2  ][S3][S4][S5][S6][S7][S8][S9][S10][S11][S12]
```

## Cronograma Detallado

| Sprint                                          | Semana | Nombre                                  | Estado        |
| ----------------------------------------------- | ------ | --------------------------------------- | ------------- |
| [SPRINT-00](sprints/SPRINT-00-setup.md)         | 1      | Setup inicial y arquitectura            | ✅ Completado |
| [SPRINT-01](sprints/SPRINT-01-design-system.md) | 2      | Sistema de diseño y componentes base    | ✅ Completado |
| [SPRINT-02](sprints/SPRINT-02-core-pages.md)    | 3-4    | Páginas core (Home, Nosotros, Contacto) | ✅ Completado |
| [SPRINT-03](sprints/SPRINT-03-services.md)      | 5      | Páginas de servicios                    | ⬜ Pendiente  |
| [SPRINT-04](sprints/SPRINT-04-storage-fleet.md) | 6      | Almacenaje, Custodia y Flota            | ⬜ Pendiente  |
| [SPRINT-05](sprints/SPRINT-05-districts.md)     | 7      | Landings de distritos                   | ⬜ Pendiente  |
| [SPRINT-06](sprints/SPRINT-06-routes.md)        | 8      | Landings de rutas inter-provinciales    | ⬜ Pendiente  |
| [SPRINT-07](sprints/SPRINT-07-blog.md)          | 9      | Blog SEO y contenido inicial            | ⬜ Pendiente  |
| [SPRINT-08](sprints/SPRINT-08-i18n-english.md)  | 10     | Internacionalización al inglés          | ⬜ Pendiente  |
| [SPRINT-09](sprints/SPRINT-09-seo-technical.md) | 11     | SEO técnico completo                    | ⬜ Pendiente  |
| [SPRINT-10](sprints/SPRINT-10-vps-deploy.md)    | 12     | VPS, Nginx, SSL y CI/CD                 | ⬜ Pendiente  |
| [SPRINT-11](sprints/SPRINT-11-qa-prelaunch.md)  | 12-13  | QA exhaustivo y pre-lanzamiento         | ⬜ Pendiente  |
| [SPRINT-12](sprints/SPRINT-12-launch.md)        | 13     | Lanzamiento y monitoreo intensivo       | ⬜ Pendiente  |

## Dependencias Entre Sprints

```
SPRINT-00 (setup)
    │
    ├──> SPRINT-01 (design system)
    │       │
    │       └──> SPRINT-02 (core pages)
    │               │
    │               ├──> SPRINT-03 (services)
    │               │       │
    │               │       └──> SPRINT-04 (storage + fleet)
    │               │               │
    │               │               ├──> SPRINT-05 (districts)
    │               │               │       │
    │               │               │       └──> SPRINT-06 (routes)
    │               │               │
    │               │               └──> SPRINT-07 (blog)
    │               │
    │               └──> SPRINT-08 (english) ─┐
    │                                         │
    │                                         v
    │                              SPRINT-09 (seo technical)
    │                                         │
    │                                         v
    │                              SPRINT-10 (vps deploy)
    │                                         │
    │                                         v
    │                              SPRINT-11 (QA)
    │                                         │
    │                                         v
    │                              SPRINT-12 (launch)
```

## Hitos Clave

| Hito                          | Cuándo        | Qué se entrega                         |
| ----------------------------- | ------------- | -------------------------------------- |
| **H1 — Setup completo**       | Fin Sprint 0  | Repo, Astro corriendo, CI básico       |
| **H2 — Diseño aprobado**      | Fin Sprint 1  | Componentes base + mockups Figma       |
| **H3 — Sitio core funcional** | Fin Sprint 4  | 15+ páginas en staging                 |
| **H4 — Cobertura completa**   | Fin Sprint 6  | 30+ páginas, todas las rutas/distritos |
| **H5 — Bilingüe + SEO**       | Fin Sprint 9  | Inglés + Schema + sitemap              |
| **H6 — Producción lista**     | Fin Sprint 11 | QA aprobado, listo para Día D          |
| **H7 — Lanzamiento**          | Fin Sprint 12 | Sitio en producción                    |

## Métricas de Avance

Al final de cada sprint, actualizar la tabla anterior:

- ⬜ Pendiente
- 🟡 En progreso
- ✅ Completado
- ❌ Bloqueado

## Cómo Usar Este Roadmap con Claude Code

```bash
# Ver siguiente sprint a ejecutar
> ¿Cuál es el próximo sprint pendiente en el ROADMAP?

# Ejecutar un sprint específico
> Ejecuta el SPRINT-00 según sprints/SPRINT-00-setup.md

# Verificar el estado de un sprint
> Revisa el estado del SPRINT-02 y dime qué tareas faltan

# Marcar sprint como completado
> Marca el SPRINT-00 como ✅ en el ROADMAP.md
```

## Estimación de Esfuerzo

- **Sprints 0-1:** Configuración. Una persona técnica, dedicación 5h/día.
- **Sprints 2-7:** Desarrollo. Una persona técnica + apoyo de redactor SEO.
- **Sprints 8-9:** Especialización. Traductor + SEO técnico.
- **Sprints 10-12:** Crítico. Una persona técnica con experiencia de servidor + un SEO en stand-by.

Total estimado de horas: ~325 horas (65 días × 5h promedio).

## Próximamente (post-lanzamiento)

Después del Sprint 12, comienza la fase de monitoreo y producción de contenido continuo (semanas 14-26):

- Producción de 2-4 artículos de blog/mes
- Reportes mensuales SEO
- Optimización iterativa según datos reales
- Eventual apertura de las rutas próximamente (Arequipa, Juliaca, Puno) cuando la operación lo permita
