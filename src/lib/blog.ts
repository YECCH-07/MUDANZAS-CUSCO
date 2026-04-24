/*
 * Utilidades del blog de cuscomudanzas.com.
 * Centralizan etiquetas humanas de categorías, helpers de formato y orden.
 */

export type BlogCategory =
  | 'consejos-de-mudanza'
  | 'embalaje'
  | 'mudanzas-de-oficina'
  | 'rutas-cusco-apurimac'
  | 'almacenaje'
  | 'precios-y-cotizaciones';

export const CATEGORIES: Record<BlogCategory, { label: string; description: string }> = {
  'consejos-de-mudanza': {
    label: 'Consejos de mudanza',
    description: 'Tips prácticos y checklists para que tu mudanza salga bien.',
  },
  embalaje: {
    label: 'Embalaje',
    description: 'Cómo proteger tus pertenencias — vajilla, electrónicos, obras de arte.',
  },
  'mudanzas-de-oficina': {
    label: 'Mudanzas de oficina',
    description: 'Planificación empresarial y traslados corporativos.',
  },
  'rutas-cusco-apurimac': {
    label: 'Rutas Cusco-Apurímac',
    description: 'Guías específicas de nuestras rutas inter-provinciales activas.',
  },
  almacenaje: {
    label: 'Almacenaje',
    description: 'Custodia de muebles y pertenencias por días, meses o años.',
  },
  'precios-y-cotizaciones': {
    label: 'Precios y cotizaciones',
    description: 'Análisis de tarifas, factores de costo y cómo cotizar bien.',
  },
};

export function formatPubDate(date: Date, locale = 'es-PE'): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
