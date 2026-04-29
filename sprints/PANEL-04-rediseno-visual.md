# PANEL-04 — Rediseño visual y polish UI

> **Objetivo:** transformar el panel interno (hoy funcional pero austero) en una
> experiencia visualmente atractiva y coherente con la marca de Expresos Ñan,
> sin sacrificar performance ni accesibilidad.
> **Cuándo:** después de PANEL-01/02/03 (todos completos) y antes del lanzamiento
> público (SPRINT-10/11/12). Ideal para correr en paralelo a SPRINT-10 deploy.

## Audiencia

- **Cotizadores** (uso diario, escritorio): necesitan velocidad y jerarquía clara.
- **Conductores** (uso intensivo en móvil): necesitan UI grande, contrastada,
  cero ruido.
- **Superadmin** (revisión periódica): necesita densidad informativa y filtros.

## Objetivos medibles

| KPI                                | Antes  | Meta  |
| ---------------------------------- | ------ | ----- |
| Tiempo medio para crear cotización | ~3 min | <90 s |
| Errores de input por sesión        | ~3     | <1    |
| Lighthouse Performance (panel)     | 75     | ≥ 90  |
| Lighthouse Accessibility (panel)   | 88     | 100   |
| Tiempo para ver "Hoy" (conductor)  | 4-6 s  | < 2 s |

## Tareas (estimado: 2-3 sprints de trabajo)

### 4.1 — Sistema de diseño

- [ ] Definir paleta extendida en [src/styles/global.css](../src/styles/global.css):
  - Primary scale: 50, 100, 200, 400, 500 (#D72638 actual = 600), 700, 800, 900
  - Tonos de éxito (verde 50→900), error (rojo 50→900), aviso (ámbar 50→900),
    info (azul 50→900). Hoy se usan colores genéricos de Tailwind sin curva.
  - Gradientes corporativos: `bg-brand-gradient` (carmesí → carmesí oscuro),
    `bg-brand-gradient-soft` (rosa muy claro → blanco).
- [ ] Tipografía: ajustar escala (display, h1, h2, body, caption) con
      `tracking-tight` en titulares y `font-feature-settings` para tabular nums en
      montos.
- [ ] Iconos: librería única (Heroicons outline) en
      [src/components/panel/icons/](../src/components/panel/) — un componente por
      icono para tree-shaking. Hoy hay SVG inline duplicados.
- [ ] Componentes base reusables (mantenerlos pequeños, sin framework):
      `<KpiCard>`, `<EmptyState>`, `<Pill>`, `<DataRow>`, `<StatusBadge>`,
      `<SectionHeader>`, `<ProgressBar>`, `<Tabs>`.

### 4.2 — Dashboards más ricos visualmente

- [ ] **AdminLayout dashboard**: cabecera con gradient hero
      (`bg-brand-gradient`) que muestre saludo personal ("Hola Yeison, hoy 25/04"),
      total ingresos del día en grande con animación de conteo.
- [ ] KpiCards con icono SVG, color de fondo sutil por categoría
      (ingresos verdes, gastos rojos, balance carmesí, viajes neutros).
- [ ] Sparkline mini-gráfico de últimos 14 días por KPI (SVG nativo, sin chart.js).
- [ ] Tabla de movimientos del día con avatar circular del conductor (iniciales
      con fondo coloreado consistente al user.id).
- [ ] Banner/toast con efeméride: "Hoy se cumplen 7 días desde el último
      servicio a Sicuani — buen momento para promover ruta".

### 4.3 — Conductor: experiencia móvil pulida

- [ ] Pantalla `/panel/conductor/hoy/` con cabecera tipo "tarjeta" mostrando:
  - Saludo + nombre + foto (si subida)
  - Unidad asignada con foto pequeña + placa grande
  - Estado del día (pre-trip, en curso, cerrado) como timeline visual de 3 pasos.
- [ ] Cards de viajes y gastos con animación de entrada (fade-in slide-up,
      CSS only).
- [ ] Botón "Iniciar viaje" / "Cerrar día" tipo FAB flotante en mobile.
- [ ] Pull-to-refresh nativo (`overscroll-behavior` + scroll listener).
- [ ] Skeleton loaders mientras carga la BD (evitar pantalla en blanco).
- [ ] Modo "kiosko" opcional para tablets en cabina: tipografía 1.5×,
      sin sidebar, atajos grandes.

### 4.4 — Cotizador: flujo más fluido

- [ ] Wizard de 3 pasos para nueva cotización (cliente → servicio → total)
      en lugar de un solo formulario largo. Stepper en la parte superior.
- [ ] Side panel con preview en vivo del PDF mientras se llena el formulario.
- [ ] Auto-completar origen/destino con las 22 localidades del Valle Sagrado
  - distritos de Cusco (datalist HTML5 leyendo de
    [src/lib/coverage.ts](../src/lib/coverage.ts)).
- [ ] Sugerencias inteligentes:
  - Si el cliente tuvo cotización aceptada antes, ofrecer "repetir servicio".
  - Si el destino es Sicuani/Abancay, sugerir las plantillas correspondientes.
- [ ] Filtros visuales en listado (chips clickables por estado, no dropdown).
- [ ] Vista kanban opcional (`/panel/cotizador/kanban/`) con columnas
      draft → sent → accepted → completed.

### 4.5 — Microinteracciones y feedback

- [ ] Transiciones suaves entre páginas (Astro view transitions API ya viene
      con Astro 6).
- [ ] Hover states en todos los botones (scale + shadow).
- [ ] Estados de loading en botones después de submit ("Guardando…").
- [ ] Confirmaciones tipo toast en lugar de `confirm()` nativo del navegador.
- [ ] Sonido sutil opcional al cerrar día (similar a app de pago).
- [ ] Confeti CSS al primer servicio cerrado del día (gamificación leve).

### 4.6 — Dark mode (opcional)

- [ ] Toggle en header del panel (no en sitio público).
- [ ] Variables CSS en `[data-theme="dark"]`.
- [ ] Recordar preferencia en localStorage.

### 4.7 — Accesibilidad

- [ ] Audit con axe-core: corregir `aria-label`s faltantes,
      `aria-current="page"` en sidebar, focus visible siempre.
- [ ] Test con lector de pantalla (NVDA/VoiceOver) en flujo conductor.
- [ ] Contraste WCAG AAA en montos (carmesí sobre blanco hoy es AA, mejorar a
      AAA con `--color-primary-700`).

## Definición de hecho

- Lighthouse Performance ≥ 90 en `/panel/admin/`, `/panel/cotizador/` y
  `/panel/conductor/hoy/`.
- Lighthouse Accessibility = 100 en las 3 páginas.
- Probado en iPhone SE (320px), Galaxy A series (360px), iPad (768px),
  laptop 1366×768, desktop 1920×1080.
- Probado en Chrome, Safari, Firefox móvil y Edge.
- 0 errores en consola.
- Todos los componentes nuevos documentados en `/styleguide/` (página interna).
