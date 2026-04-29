/*
 * Catálogo central de iconos (SVG path data) usados en el panel.
 * Heroicons outline 24×24, viewBox 0 0 24 24, stroke-width 2.
 *
 * Usar como `<path d={ICONS.users} />` o pasar el string al prop iconHref
 * de KpiCard / EmptyState.
 */
export const ICONS = {
  // Generales
  home: 'M3 10.5L12 3l9 7.5V21a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 21V10.5z',
  users:
    'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M22 21v-2a4 4 0 00-3-3.87 M16 3.13A4 4 0 0116 11',
  truck:
    'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  calculator:
    'M9 7h6m-6 4h6m-6 4h.01M15 15h.01 M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01',
  chart: 'M3 3v18h18 M7 14l4-4 4 4 5-5',
  history: 'M3 3v5h5 M3.05 13A9 9 0 106 5.3L3 8 M12 7v5l3 3',
  cash: 'M12 8v8 M9 11h6 M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z',
  doc: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  check: 'M5 13l4 4L19 7',
  clock: 'M12 8v4l3 2 M12 22a10 10 0 110-20 10 10 0 010 20z',
  warning:
    'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  arrowUp: 'M12 19V5 M5 12l7-7 7 7',
  arrowDown: 'M12 5v14 M19 12l-7 7-7-7',
  trendingUp: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  trendingDown: 'M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  plus: 'M12 5v14 M5 12h14',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  sparkles:
    'M12 3l1.9 5.8L20 11l-5.8 1.9L12 19l-1.9-5.8L5 11l5.8-1.9z M5 3v4 M3 5h4 M19 17v4 M17 19h4',
  package:
    'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96l8.73 5.05 8.73-5.05 M12 22.08V12',
  wrench: 'M14.7 6.3a4 4 0 005.4 5.4l-9.1 9.1a2.83 2.83 0 11-4-4l9.1-9.1a4 4 0 01-1.4-1.4z',
  receipt:
    'M5 3a1 1 0 011-1h12a1 1 0 011 1v18l-2-2-2 2-2-2-2 2-2-2-2 2-2-2-2 2V3z M9 7h6 M9 11h6 M9 15h4',
  route: 'M5 6a3 3 0 116 0c0 4-6 6-6 12h6 M21 12a3 3 0 11-6 0 3 3 0 016 0z',
} as const;

export type IconKey = keyof typeof ICONS;
