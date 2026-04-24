/**
 * Áreas de cobertura de Expresos Ñan, organizadas por cercanía a Cusco ciudad.
 * Fuente única de verdad — consumida por Home, /mudanza-provincia/,
 * /mudanzas-locales-.../, Footer y NAV del header.
 *
 * Actualizado 2026-04-24 con la expansión al Valle Sagrado (22 localidades nuevas).
 */

export interface Locality {
  name: string;
  province: string;
  region: 'Cusco' | 'Apurímac';
  /** Slug de landing propia si existe, si no queda la cotización directa por WhatsApp. */
  slug?: string;
}

export interface CoverageZone {
  id: string;
  label: string;
  timeRange: string;
  description: string;
  localities: Locality[];
}

/**
 * Zona 1 — Cusco metropolitano (hasta 1 hora, distritos con landings individuales).
 */
export const METRO: CoverageZone = {
  id: 'metro',
  label: 'Cusco metropolitano',
  timeRange: 'Hasta 1 hora',
  description:
    'Distritos del área metropolitana de Cusco. Mudanzas resueltas en el mismo día, normalmente sin recargo por distancia.',
  localities: [
    { name: 'Cusco Centro', province: 'Cusco', region: 'Cusco', slug: 'mudanzas-cusco-centro' },
    { name: 'Wanchaq', province: 'Cusco', region: 'Cusco', slug: 'mudanzas-wanchaq' },
    {
      name: 'San Sebastián',
      province: 'Cusco',
      region: 'Cusco',
      slug: 'mudanzas-san-sebastian',
    },
    { name: 'San Jerónimo', province: 'Cusco', region: 'Cusco', slug: 'mudanzas-san-jeronimo' },
    { name: 'Santiago', province: 'Cusco', region: 'Cusco', slug: 'mudanzas-santiago' },
    { name: 'Saylla', province: 'Cusco', region: 'Cusco', slug: 'mudanzas-saylla' },
    { name: 'Poroy', province: 'Cusco', region: 'Cusco', slug: 'mudanzas-poroy' },
    { name: 'Ccorca', province: 'Cusco', region: 'Cusco', slug: 'mudanzas-ccorca' },
  ],
};

/**
 * Zona 2 — Valle Sagrado y alrededores (1-4 horas).
 * Mudanzas provinciales cercanas: Valle Sagrado, Quispicanchi, Anta, Paruro, Paucartambo.
 * Servicio activo; cotización por WhatsApp sin landing individual (de momento).
 */
export const VALLE_SAGRADO_1_2H: CoverageZone = {
  id: 'valle-1-2h',
  label: 'Valle Sagrado y Anta cercano',
  timeRange: 'De 1 a 2 horas',
  description:
    'Corazón del Valle Sagrado y ruta Cusco-Anta. Servicio activo para mudanzas familiares, fletes comerciales y traslados turísticos.',
  localities: [
    { name: 'Pisac', province: 'Calca', region: 'Cusco' },
    { name: 'Calca', province: 'Calca', region: 'Cusco' },
    { name: 'Urubamba', province: 'Urubamba', region: 'Cusco' },
    { name: 'Chinchero', province: 'Urubamba', region: 'Cusco' },
    { name: 'Anta', province: 'Anta', region: 'Cusco' },
    { name: 'Coya', province: 'Calca', region: 'Cusco' },
  ],
};

export const VALLE_SAGRADO_2_3H: CoverageZone = {
  id: 'valle-2-3h',
  label: 'Valle Sagrado profundo y sierra de Anta',
  timeRange: 'De 2 a 3 horas',
  description:
    'Localidades más alejadas del Valle Sagrado y provincia de Anta. Servicio activo con coordinación previa.',
  localities: [
    { name: 'Ollantaytambo', province: 'Urubamba', region: 'Cusco' },
    { name: 'Yucay', province: 'Urubamba', region: 'Cusco' },
    { name: 'Maras', province: 'Urubamba', region: 'Cusco' },
    { name: 'Mollepata', province: 'Anta', region: 'Cusco' },
    { name: 'Limatambo', province: 'Anta', region: 'Cusco' },
    { name: 'Huarocondo', province: 'Anta', region: 'Cusco' },
    { name: 'Zurite', province: 'Anta', region: 'Cusco' },
  ],
};

export const VALLE_SAGRADO_3_4H: CoverageZone = {
  id: 'valle-3-4h',
  label: 'Quispicanchi, Calca alta y provincias cercanas',
  timeRange: 'De 3 a 4 horas',
  description:
    'Rutas con algo más de distancia: Quispicanchi, Calca alta (Lares, Yanatile), Machupicchu Pueblo (Aguas Calientes), Paruro y Paucartambo.',
  localities: [
    { name: 'Lares', province: 'Calca', region: 'Cusco' },
    { name: 'Yanatile', province: 'Calca', region: 'Cusco' },
    { name: 'Machupicchu (Aguas Calientes)', province: 'Urubamba', region: 'Cusco' },
    { name: 'Oropesa', province: 'Quispicanchi', region: 'Cusco' },
    { name: 'Urcos', province: 'Quispicanchi', region: 'Cusco' },
    { name: 'Andahuaylillas', province: 'Quispicanchi', region: 'Cusco' },
    { name: 'Lucre', province: 'Quispicanchi', region: 'Cusco' },
    { name: 'Paruro', province: 'Paruro', region: 'Cusco' },
    { name: 'Paucartambo', province: 'Paucartambo', region: 'Cusco' },
  ],
};

/**
 * Zona 3 — Inter-provinciales lejanas (5-12 h). Cada una tiene landing propia en SPRINT-06.
 */
export const INTERPROVINCIAL: CoverageZone = {
  id: 'interprovincial',
  label: 'Rutas inter-provinciales largas',
  timeRange: 'De 5 a 12 horas',
  description:
    'Rutas activas hacia Canchis (Sicuani), Apurímac (Abancay, Las Bambas: Challhuahuacho, Tambobamba, Haquira, Mara, Coyllurqui) y Chumbivilcas (Colquemarca, Capacmarca).',
  localities: [
    { name: 'Sicuani', province: 'Canchis', region: 'Cusco', slug: 'mudanzas-cusco-sicuani' },
    {
      name: 'Abancay',
      province: 'Abancay',
      region: 'Apurímac',
      slug: 'mudanzas-cusco-abancay',
    },
    {
      name: 'Challhuahuacho',
      province: 'Cotabambas',
      region: 'Apurímac',
      slug: 'mudanzas-cusco-challhuahuacho',
    },
    {
      name: 'Tambobamba',
      province: 'Cotabambas',
      region: 'Apurímac',
      slug: 'mudanzas-cusco-tambobamba',
    },
    {
      name: 'Haquira',
      province: 'Cotabambas',
      region: 'Apurímac',
      slug: 'mudanzas-cusco-haquira',
    },
    { name: 'Mara', province: 'Cotabambas', region: 'Apurímac', slug: 'mudanzas-cusco-mara' },
    {
      name: 'Coyllurqui',
      province: 'Cotabambas',
      region: 'Apurímac',
      slug: 'mudanzas-cusco-coyllurqui',
    },
    {
      name: 'Colquemarca',
      province: 'Chumbivilcas',
      region: 'Cusco',
      slug: 'mudanzas-cusco-colquemarca',
    },
    {
      name: 'Capacmarca',
      province: 'Chumbivilcas',
      region: 'Cusco',
      slug: 'mudanzas-cusco-capacmarca',
    },
  ],
};

/** Todas las zonas agrupadas por cercanía (útil para iterar en Home o /cobertura/). */
export const ALL_ZONES: CoverageZone[] = [
  METRO,
  VALLE_SAGRADO_1_2H,
  VALLE_SAGRADO_2_3H,
  VALLE_SAGRADO_3_4H,
  INTERPROVINCIAL,
];

/** Subset Valle Sagrado como un solo bloque, útil para secciones sintéticas. */
export const VALLE_SAGRADO_ALL: CoverageZone = {
  id: 'valle-sagrado',
  label: 'Valle Sagrado y alrededores de Cusco',
  timeRange: '1 a 4 horas',
  description:
    'Mudanzas cortas a distritos del Valle Sagrado, Quispicanchi, Anta, Paruro y Paucartambo. 22 localidades con servicio activo.',
  localities: [
    ...VALLE_SAGRADO_1_2H.localities,
    ...VALLE_SAGRADO_2_3H.localities,
    ...VALLE_SAGRADO_3_4H.localities,
  ],
};
