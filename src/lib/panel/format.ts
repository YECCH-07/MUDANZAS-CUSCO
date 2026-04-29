/*
 * Helpers de formato para la UI del panel.
 *
 * Convenciones del proyecto:
 *  - Montos en BD se almacenan en céntimos (integer) para evitar floats.
 *  - En la UI siempre se muestran como soles ("S/ 1,234.56").
 *  - Fechas en BD son ISO-8601 UTC; en la UI se muestran en hora Lima.
 */

const SOLES_FMT = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const LIMA_DATE_FMT = new Intl.DateTimeFormat('es-PE', {
  timeZone: 'America/Lima',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const LIMA_DATETIME_FMT = new Intl.DateTimeFormat('es-PE', {
  timeZone: 'America/Lima',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const LIMA_TIME_FMT = new Intl.DateTimeFormat('es-PE', {
  timeZone: 'America/Lima',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** "12345" céntimos → "S/ 123.45". Acepta null/undefined → "S/ 0.00". */
export function soles(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100;
  return SOLES_FMT.format(value).replace(/\u00A0/g, ' ');
}

/** Soles a céntimos (input form). "12.50" → 1250. */
export function solesToCents(input: string | number): number {
  const n = typeof input === 'number' ? input : Number(String(input).replace(',', '.').trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

/** ISO o Date a "DD/MM/YYYY" (zona Lima). */
export function fmtDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return LIMA_DATE_FMT.format(d);
}

/** ISO o Date a "DD/MM/YYYY HH:mm" (zona Lima). */
export function fmtDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return LIMA_DATETIME_FMT.format(d).replace(',', '');
}

/** ISO o Date a "HH:mm" (zona Lima). */
export function fmtTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return LIMA_TIME_FMT.format(d);
}
