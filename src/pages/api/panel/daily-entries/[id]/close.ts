/*
 * POST /api/panel/daily-entries/[id]/close
 * Cierra manualmente el día. Exige odometer_end_km y termina viajes abiertos.
 * El cierre automático lo hace el cron a las 12:00 Lima del día siguiente.
 */
import type { APIRoute } from 'astro';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, trips } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

function redirectToDay(unitId: string, error?: string): Response {
  const params = new URLSearchParams({ unit: unitId, ...(error ? { error } : {}) });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/conductor/hoy/?${params.toString()}` },
  });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const entryId = ctx.params.id;
  if (!entryId) return new Response('missing id', { status: 400 });

  const entry = await db.select().from(dailyEntries).where(eq(dailyEntries.id, entryId)).get();
  if (!entry) return new Response('not found', { status: 404 });

  if (user.role === 'conductor' && entry.driverId !== user.id) {
    return new Response('forbidden', { status: 403 });
  }
  if (entry.closedAt !== null) {
    return redirectToDay(entry.unitId);
  }

  if (entry.odometerEndKm === null) {
    return redirectToDay(entry.unitId, 'odometer-end-required');
  }

  // Cerrar viajes abiertos automáticamente con ended_at=ahora.
  const now = new Date().toISOString();
  await db
    .update(trips)
    .set({ endedAt: now, updatedAt: now })
    .where(and(eq(trips.entryId, entryId), isNull(trips.endedAt)));

  await db
    .update(dailyEntries)
    .set({ closedAt: now, updatedAt: now })
    .where(eq(dailyEntries.id, entryId));

  await logAudit(ctx, {
    action: 'daily_entry.close',
    target: `entry:${entryId}`,
    diff: { manual: true },
  });

  return redirectToDay(entry.unitId);
};
