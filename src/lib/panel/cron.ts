/*
 * Tareas programadas del panel interno.
 *
 * Schedules:
 *  - 12:00 Lima diario: cerrar automáticamente todo `daily_entries` con
 *    `entry_date <= ayer` y `closed_at IS NULL` + cerrar viajes abiertos
 *    asociados + podar `login_attempts` > 24h.
 *  - 03:00 Lima diario: podar sesiones expiradas.
 *
 * El cron se inicia con `startCron()` una sola vez al arrancar el servidor
 * Astro (ver src/cron-init.ts). En dev con `astro dev` no se ejecuta
 * automáticamente (import dinámico condicional) para evitar múltiples
 * instances al recargar.
 */
/* eslint-disable no-console -- logs del cron van a journald en producción */
import cron from 'node-cron';
import { and, eq, isNull, lte } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, trips, auditLog } from '@db/schema';
import { yesterdayLimaISO } from '@lib/panel/lima-date';
import { pruneExpiredSessions } from '@lib/auth/session';
import { pruneOldLoginAttempts } from '@lib/auth/rate-limit';
import { ulid } from '@lib/auth/ulid';

const TZ = 'America/Lima';
let started = false;

export function startCron(): void {
  if (started) return;
  started = true;
  console.log('[cron] arrancado en zona', TZ);

  // Cierre diario de entries: todos los días a las 12:00:00 Lima.
  cron.schedule(
    '0 12 * * *',
    async () => {
      try {
        const closed = await closeYesterdayEntries();
        console.log(`[cron] 12:00 · cerradas ${closed} daily_entries`);
      } catch (err) {
        console.error('[cron] error en cierre diario', err);
      }
    },
    { timezone: TZ },
  );

  // Limpieza nocturna.
  cron.schedule(
    '0 3 * * *',
    async () => {
      try {
        const s = await pruneExpiredSessions();
        const l = await pruneOldLoginAttempts();
        console.log(`[cron] 03:00 · sesiones podadas ${s} · logins podados ${l}`);
      } catch (err) {
        console.error('[cron] error en limpieza nocturna', err);
      }
    },
    { timezone: TZ },
  );
}

/**
 * Cierra todas las daily_entries con entry_date <= ayer y closed_at NULL.
 * Si un trip sigue abierto al cerrar, también se cierra con ended_at = now.
 * Devuelve la cantidad de entries cerradas.
 *
 * Exportado para permitir invocación manual desde scripts/close-entries.mjs
 * en caso de que el cron no haya corrido (ver PANEL-OPERACION.md §3.13).
 */
export async function closeYesterdayEntries(): Promise<number> {
  const yesterday = yesterdayLimaISO();
  const now = new Date().toISOString();

  const toClose = await db
    .select()
    .from(dailyEntries)
    .where(and(lte(dailyEntries.entryDate, yesterday), isNull(dailyEntries.closedAt)))
    .all();

  let count = 0;
  for (const e of toClose) {
    // Cerrar trips abiertos
    await db
      .update(trips)
      .set({ endedAt: now, updatedAt: now })
      .where(and(eq(trips.entryId, e.id), isNull(trips.endedAt)));

    await db
      .update(dailyEntries)
      .set({ closedAt: now, updatedAt: now })
      .where(eq(dailyEntries.id, e.id));

    await db.insert(auditLog).values({
      id: ulid(),
      userId: null,
      action: 'daily_entry.auto_close',
      target: `entry:${e.id}`,
      diffJson: JSON.stringify({
        entryDate: e.entryDate,
        unitId: e.unitId,
        driverId: e.driverId,
      }),
      ip: null,
      at: now,
    });

    count++;
  }

  return count;
}
