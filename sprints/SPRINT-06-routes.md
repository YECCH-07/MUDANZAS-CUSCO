# SPRINT 06 — Landings de Rutas Inter-Provinciales

**Duración:** 5 días (Semana 8)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-05 completado.

## Objetivo

Crear las 9 landings de rutas inter-provinciales activas + 4 landings "Próximamente" (con captación de leads anticipada). Esta es la mayor expansión de cobertura SEO del proyecto.

## URLs a crear

### Rutas activas (9 páginas — operativas)

| URL | Ruta | Provincia destino |
|-----|------|-------------------|
| `/mudanzas-cusco-sicuani/` | Cusco ↔ Sicuani | Canchis, Cusco |
| `/mudanzas-cusco-abancay/` | Cusco ↔ Abancay | Apurímac (capital) |
| `/mudanzas-cusco-challhuahuacho/` | Cusco ↔ Challhuahuacho | Cotabambas, Apurímac |
| `/mudanzas-cusco-tambobamba/` | Cusco ↔ Tambobamba | Cotabambas, Apurímac |
| `/mudanzas-cusco-haquira/` | Cusco ↔ Haquira | Cotabambas, Apurímac |
| `/mudanzas-cusco-mara/` | Cusco ↔ Mara | Cotabambas, Apurímac |
| `/mudanzas-cusco-coyllurqui/` | Cusco ↔ Coyllurqui | Cotabambas, Apurímac |
| `/mudanzas-cusco-colquemarca/` | Cusco ↔ Colquemarca | Chumbivilcas, Cusco |
| `/mudanzas-cusco-capacmarca/` | Cusco ↔ Capacmarca | Chumbivilcas, Cusco |

### Rutas próximamente (4 páginas — captación de leads)

| URL | Ruta | Estado |
|-----|------|--------|
| `/mudanzas-cusco-arequipa/` | Cusco → Arequipa | Próximamente |
| `/mudanzas-arequipa-cusco/` | Arequipa → Cusco | Próximamente (sentido inverso) |
| `/mudanzas-cusco-juliaca/` | Cusco → Juliaca | Próximamente |
| `/mudanzas-cusco-puno/` | Cusco → Puno | Próximamente |

**IMPORTANTE — La ruta Cusco-Arequipa es bidireccional**, por eso son 2 landings dedicadas: una para captar tráfico desde Cusco y otra desde Arequipa.

## Plantilla común para rutas activas

Cada landing de ruta activa incluye:

1. **Hero**
   - H1: "Mudanzas Cusco-[Destino] | Servicio Profesional Inter-Provincial"
   - Imagen contextual de la ruta

2. **Breadcrumbs:** Inicio › Cobertura › Cusco-[Destino]

3. **Información de la ruta:**
   - Distancia aproximada
   - Tiempo estimado del recorrido
   - Tipo de carretera (asfaltada, afirmada)
   - Paradas intermedias
   - Consideraciones especiales (altura, clima)

4. **Mapa visual de la ruta** (Leaflet con polilínea origen-destino)

5. **Tipos de mudanza atendidos en esta ruta:**
   - Mudanzas familiares
   - Mudanzas de oficina
   - Flete comercial
   - Para personal del sector minero (si aplica, ej: Las Bambas)

6. **Tabla de unidades disponibles para esta ruta:**
   - Unidad recomendada según volumen
   - Tarifas referenciales

7. **Servicios complementarios:**
   - Embalaje en origen
   - Custodia/almacenaje temporal en Cusco mientras llega el destino
   - Armado de muebles en destino

8. **FAQs específicas de la ruta:**
   - ¿Cuánto tarda la mudanza?
   - ¿Requiere permisos especiales?
   - ¿Cómo se paga?
   - ¿Se asegura la carga?

9. **Testimonios** de clientes que hicieron esta ruta

10. **CTA WhatsApp:**
    - "Hola, necesito cotización para mudanza Cusco-[Destino]. Mi inventario aproximado es..."

## Plantilla específica para rutas "Próximamente"

Estructura simplificada con captación anticipada:

1. **Hero con badge "Próximamente"**
   - H1: "Mudanzas Cusco-Arequipa | Próximamente"
   - Subtítulo: "Estamos por inaugurar esta ruta. Déjanos tus datos y te avisaremos en cuanto esté operativa."

2. **Banner explicativo:**
   - "Esta ruta aún no está operativa. Estamos preparando la flota y operación logística para abrirla próximamente."

3. **Información preliminar de la ruta** (distancia, tiempo estimado).

4. **Formulario de pre-registro:**
   - Nombre
   - WhatsApp
   - Fecha tentativa de mudanza
   - Volumen estimado
   - Origen exacto
   - Destino exacto
   - Comentarios

5. **Rutas alternativas que SÍ atendemos hoy:** lista con enlaces a las 9 rutas activas.

6. **Schema.org Service con estado "PreOrder"** o sin AggregateRating.

## Tareas

### Tarea 6.1 — Content Collection de rutas

`src/content/config.ts` (extender):

```typescript
const routes = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    origin: z.string(),
    destination: z.string(),
    bidirectional: z.boolean().default(false),
    status: z.enum(['active', 'coming-soon']),
    distance_km: z.number(),
    duration_hours: z.string(),
    province: z.string(),
    region: z.string(),
    notes: z.string(),
    intermediate_stops: z.array(z.string()).optional(),
    relevant_industries: z.array(z.string()).optional(),
    coordinates: z.object({
      origin: z.object({ lat: z.number(), lng: z.number() }),
      destination: z.object({ lat: z.number(), lng: z.number() }),
    }),
  }),
});
```

### Tarea 6.2 — Crear archivos de datos para 9 rutas activas

Ejemplo `src/content/routes/cusco-challhuahuacho.json`:

```json
{
  "slug": "cusco-challhuahuacho",
  "origin": "Cusco",
  "destination": "Challhuahuacho",
  "status": "active",
  "distance_km": 425,
  "duration_hours": "10-12",
  "province": "Cotabambas",
  "region": "Apurímac",
  "notes": "Ruta principal hacia el proyecto minero Las Bambas. Incluye paso por Abancay y Tambobamba.",
  "intermediate_stops": ["Abancay", "Tambobamba"],
  "relevant_industries": ["Minería (Las Bambas)", "Construcción"],
  "coordinates": {
    "origin": { "lat": -13.5319, "lng": -71.9675 },
    "destination": { "lat": -14.0833, "lng": -72.2667 }
  }
}
```

Repetir para las 9 rutas activas.

### Tarea 6.3 — Crear archivos para 4 rutas próximamente

Ejemplo `src/content/routes/cusco-arequipa.json`:

```json
{
  "slug": "cusco-arequipa",
  "origin": "Cusco",
  "destination": "Arequipa",
  "bidirectional": true,
  "status": "coming-soon",
  "distance_km": 521,
  "duration_hours": "10-11",
  "province": "Arequipa",
  "region": "Arequipa",
  "notes": "Ruta próximamente disponible. Estimado de apertura: por confirmar.",
  "coordinates": {
    "origin": { "lat": -13.5319, "lng": -71.9675 },
    "destination": { "lat": -16.4090, "lng": -71.5375 }
  }
}
```

Y su contraparte `arequipa-cusco.json` (sentido inverso).

### Tarea 6.4 — Crear `src/pages/[route].astro` dinámico

```astro
---
import { getCollection } from 'astro:content';
import RouteLayout from '@layouts/RouteLayout.astro';
import RouteComingSoonLayout from '@layouts/RouteComingSoonLayout.astro';

export async function getStaticPaths() {
  const routes = await getCollection('routes');
  return routes.map((r) => ({
    params: { route: `mudanzas-${r.data.slug}` },
    props: { route: r.data },
  }));
}

const { route } = Astro.props;
const Layout = route.status === 'active' ? RouteLayout : RouteComingSoonLayout;
---

<Layout route={route} />
```

### Tarea 6.5 — Crear `RouteLayout.astro` (rutas activas)

Implementación completa con todos los bloques descritos arriba.

### Tarea 6.6 — Crear `RouteComingSoonLayout.astro`

Layout especial con formulario de pre-registro y banner "próximamente".

### Tarea 6.7 — Implementar formulario de pre-registro

Usar Web3Forms o endpoint custom. Etiquetar leads con campo `route` para filtrar después por interés.

### Tarea 6.8 — Mapa de ruta con Leaflet

Componente `<RouteMap>` que dibuje la línea entre origen y destino con marcadores en cada extremo.

### Tarea 6.9 — Página `/cobertura/` (índice)

Página resumen con todas las rutas activas + próximamente, organizadas por región. Agregar al menú principal.

### Tarea 6.10 — Internal linking masivo

- Cada ruta enlaza a su provincia (si tiene varias rutas en la misma provincia)
- Cada ruta activa enlaza a `/almacenaje-y-custodia-cusco/` como servicio complementario
- Cada ruta activa enlaza a `/flota-de-camiones-cusco/` para info de unidades
- Las rutas próximamente enlazan a las activas más cercanas como alternativa

## Criterios de Aceptación

- [ ] 13 landings publicadas (9 activas + 4 próximamente)
- [ ] Mapa Leaflet con ruta visible en cada una
- [ ] Formulario de pre-registro funcional en próximamente
- [ ] Schema.org Service válido en todas
- [ ] Internal linking implementado
- [ ] Word count ≥ 700 palabras únicas por ruta activa
- [ ] Mensaje WhatsApp con destino contextual
- [ ] Lighthouse 95+ en todas
- [ ] Página índice `/cobertura/` publicada

## Siguiente Sprint

**[SPRINT-07 — Blog SEO](SPRINT-07-blog.md)**
