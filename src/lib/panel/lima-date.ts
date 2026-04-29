/*
 * Utilidades de fecha en zona horaria America/Lima (UTC-5, sin DST).
 *
 * Regla del negocio (PANEL-INTERNO.md §5.1):
 *  - `entry_date` de un `daily_entries` es la **fecha de salida del viaje**
 *    en hora Lima. Si el conductor sale 23:00 del lunes, `entry_date`=lunes
 *    aunque los ítems se registren ya en martes.
 *  - El cron cierra a las 12:00 Lima del día N+1 toda entry con
 *    `entry_date <= N` y `closed_at IS NULL`.
 */

/** `yyyy-mm-dd` en hora Lima para el instante actual. */
export function todayLimaISO(now: Date = new Date()): string {
  // Intl con timeZone devuelve componentes correctos sin sumas manuales
  // (robusto a cambios hipotéticos de DST en Perú).
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(now); // en-CA formatea como yyyy-mm-dd
}

/** `yyyy-mm-dd` del día anterior Lima. */
export function yesterdayLimaISO(now: Date = new Date()): string {
  const today = todayLimaISO(now);
  const [y, m, d] = today.split('-').map(Number);
  // Crear un Date UTC al medio día para evitar DST/rolling edge.
  const t = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
  t.setUTCDate(t.getUTCDate() - 1);
  const yy = t.getUTCFullYear();
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Hora (0-23) actual en zona Lima. */
export function currentLimaHour(now: Date = new Date()): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Lima',
    hour: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const h = parts.find((p) => p.type === 'hour')?.value ?? '0';
  // en-US con hour12:false a veces devuelve "24" para medianoche; normalizar.
  const n = Number(h);
  return n === 24 ? 0 : n;
}

/**
 * ISO 8601 completo en Lima (ej. 2026-04-24T15:30:00-05:00).
 * Usado en lugar de toISOString() cuando queremos que el string sea legible
 * por el humano en Perú.
 */
export function nowLimaISOString(now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const yyyy = parts.year;
  const mm = parts.month;
  const dd = parts.day;
  const HH = parts.hour === '24' ? '00' : parts.hour;
  const MM = parts.minute;
  const SS = parts.second;
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}-05:00`;
}
