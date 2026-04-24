# SPRINT 05 — Landings de Distritos de Cusco

**Duración:** 5 días (Semana 7)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-04 completado.

## Objetivo

Crear 8 landing pages específicas para los distritos de Cusco metropolitano. Cada una con SEO local, mapa del distrito, mención de calles principales y conversión optimizada. Esto multiplica la captación orgánica en búsquedas hiper-locales.

## URLs a crear

| URL | Distrito |
|-----|----------|
| `/mudanzas-cusco-centro/` | Cusco Centro Histórico |
| `/mudanzas-wanchaq/` | Wanchaq |
| `/mudanzas-san-sebastian/` | San Sebastián |
| `/mudanzas-san-jeronimo/` | San Jerónimo |
| `/mudanzas-santiago/` | Santiago |
| `/mudanzas-saylla/` | Saylla |
| `/mudanzas-poroy/` | Poroy |
| `/mudanzas-ccorca/` | Ccorca |

## Plantilla común

Crear `src/layouts/DistrictLayout.astro` que envuelva las 8 páginas con la misma estructura, alimentada por una Content Collection.

### Estructura de cada landing

1. **Hero localizado**
   - H1: "Mudanzas en [DISTRITO], Cusco — Servicio Local Profesional"
   - Foto del distrito si está disponible

2. **Breadcrumbs:** Inicio › Cobertura › [Distrito]

3. **Mapa del distrito** (Google Maps embebido o Leaflet)

4. **Descripción del servicio en el distrito** (mínimo 800 palabras únicas):
   - Características del distrito que afectan el servicio
   - Calles principales atendidas
   - Puntos de referencia
   - Particularidades (zona histórica con calles angostas, zona residencial moderna, etc.)

5. **Servicios disponibles en el distrito:**
   - Mudanzas familiares
   - Mudanzas de oficina
   - Flete y carga
   - Embalaje
   - Almacenaje (si aplica con bodega cercana)

6. **Tabla de tiempos y precios referenciales** desde/hacia el distrito

7. **Testimonios de clientes del distrito** (si disponibles)

8. **FAQs específicas del distrito** (3-5):
   - ¿Atienden la zona histórica con calles peatonales?
   - ¿Cuánto tiempo toma una mudanza dentro del distrito?
   - ¿Qué pasa si el camión no puede acceder a la calle?

9. **CTA WhatsApp localizado:**
   - "Hola, necesito mudanza en [DISTRITO]. Mi origen es [...] y destino [...]"

10. **Cobertura ampliada:** enlaces a otros distritos cercanos

## Tareas

### Tarea 5.1 — Crear Content Collection de distritos

`src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const districts = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    region: z.string(),
    province: z.string(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }),
    mainStreets: z.array(z.string()),
    landmarks: z.array(z.string()),
    description: z.string(),
    challenges: z.string().optional(),
    averagePrice: z.string(),
    population: z.number().optional(),
  }),
});

export const collections = { districts };
```

### Tarea 5.2 — Crear archivos de datos

Para cada distrito, `src/content/districts/[slug].json`:

**Ejemplo `wanchaq.json`:**
```json
{
  "slug": "wanchaq",
  "name": "Wanchaq",
  "region": "Cusco",
  "province": "Cusco",
  "coordinates": { "lat": -13.5286, "lng": -71.9697 },
  "mainStreets": ["Av. La Cultura", "Av. Tullumayo", "Av. de la Cultura", "Av. Pardo"],
  "landmarks": ["UNSAAC", "Centro Comercial Real Plaza", "Plaza Túpac Amaru"],
  "description": "Wanchaq es uno de los distritos más densamente poblados de Cusco metropolitano, con áreas residenciales modernas, comerciales y educativas.",
  "challenges": "Tráfico denso en horas punta. Zonas con limitación de carga pesada en ciertas vías.",
  "averagePrice": "S/ 250 - S/ 800 según volumen",
  "population": 65000
}
```

Repetir para los 8 distritos.

### Tarea 5.3 — Crear `src/pages/[district].astro` dinámico

```astro
---
import { getCollection } from 'astro:content';
import DistrictLayout from '@layouts/DistrictLayout.astro';

export async function getStaticPaths() {
  const districts = await getCollection('districts');
  return districts.map((d) => ({
    params: { district: `mudanzas-${d.data.slug}` },
    props: { district: d.data },
  }));
}

const { district } = Astro.props;
---

<DistrictLayout district={district} />
```

### Tarea 5.4 — Implementar mapa con Leaflet (open source)

Para no depender de Google Maps API.

```bash
npm install leaflet
```

Crear `src/components/DistrictMap.astro`:

```astro
---
interface Props {
  lat: number;
  lng: number;
  districtName: string;
}
const { lat, lng, districtName } = Astro.props;
---

<div id="district-map" class="h-96 w-full rounded-lg" data-lat={lat} data-lng={lng} data-name={districtName}></div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<script>
  import L from 'leaflet';

  const mapEl = document.getElementById('district-map')!;
  const lat = parseFloat(mapEl.dataset.lat!);
  const lng = parseFloat(mapEl.dataset.lng!);
  const name = mapEl.dataset.name!;

  const map = L.map('district-map').setView([lat, lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);
  L.marker([lat, lng]).addTo(map).bindPopup(`Mudanzas en ${name}`).openPopup();
</script>
```

### Tarea 5.5 — Schema.org LocalBusiness con areaServed

Cada landing debe tener Schema.org con `areaServed` específico:

```json
{
  "@type": "MovingCompany",
  "areaServed": {
    "@type": "City",
    "name": "Wanchaq, Cusco, Perú"
  }
}
```

### Tarea 5.6 — Componente "Otros distritos cercanos"

Mostrar en cada landing los 3-4 distritos más cercanos con enlaces.

### Tarea 5.7 — Actualizar dropdown "Cobertura" del Header

Listar los 8 distritos en el dropdown de Cobertura.

## Criterios de Aceptación

- [ ] 8 landings de distritos publicadas
- [ ] Cada una con contenido único (no copy-paste)
- [ ] Mapa Leaflet funcionando en cada una
- [ ] Schema.org LocalBusiness con areaServed correcto
- [ ] Word count ≥ 800 palabras únicas por página
- [ ] CTAs WhatsApp localizados
- [ ] Internal linking entre distritos cercanos
- [ ] Lighthouse 95+ en todas

## Siguiente Sprint

**[SPRINT-06 — Landings de Rutas Inter-Provinciales](SPRINT-06-routes.md)**
