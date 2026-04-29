/*
 * POST /api/panel/daily-entries/[id]/odometer
 * Fija el kilometraje inicial o final del día.
 *
 * Body:
 *  - kind: 'start' | 'end'
 *  - km: integer
 *
 * Validaciones:
 *  - start: si el día anterior cerrado existe, el nuevo start >= odometer_end_km
 *    del anterior (tolerancia ±2 km).
 *  - end: debe ser >= odometer_start_km del mismo día.
 *  - No se puede modificar si el día ya está cerrado.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, desc, eq, isNotNull, lt } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  kind: z.enum(['start', 'end']),
  km: z.coerce.number().int().min(0).max(9_999_999),
});

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

function redirectToDay(unitId: string, error?: string): Response {
  const url = new URL(`http://placeholder/panel/conductor/hoy/`);
  url.searchParams.set('unit', unitId);
  if (error) url.searchParams.set('error', error);
  // Usamos path relativo (el cliente la resuelve contra origin).
  return new Response(null, {
    status: 303,
    headers: { Location: `${url.pathname}?${url.searchParams.toString()}` },
  });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const entryId = ctx.params.id;
  if (!entryId) return new Response('missing id', { status: 400 });

  const entry = await db.select().from(dailyEntries).where(eq(dailyEntries.id, entryId)).get();
  if (!entry) return new Response('entry not found', { status: 404 });

  if (user.role === 'conductor' && entry.driverId !== user.id) {
    return new Response('forbidden', { status: 403 });
  }
  if (entry.closedAt !== null) {
    return redirectToDay(entry.unitId, 'closed');
  }

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirectToDay(entry.unitId, 'invalid-km');
  }
  const { kind, km } = parsed.data;

  if (kind === 'start') {
    // Buscar el odometer_end del día anterior cerrado para continuidad.
    const prev = await db
      .select()
      .from(dailyEntries)
      .where(
        and(
          eq(dailyEntries.unitId, entry.unitId),
          lt(dailyEntries.entryDate, entry.entryDate),
          isNotNull(dailyEntries.odometerEndKm),
        ),
      )
      .orderBy(desc(dailyEntries.entryDate))
      .limit(1)
      .get();

    if (prev && prev.odometerEndKm !== null) {
      // Tolerancia de ±2 km por errores de lectura manual.
      if (km < prev.odometerEndKm - 2) {
        return redirectToDay(entry.unitId, 'km-discontinuous');
      }
    }

    await db
      .update(dailyEntries)
      .set({ odometerStartKm: km, updatedAt: new Date().toISOString() })
      .where(eq(dailyEntries.id, entryId));
  } else {
    // end: debe ser >= start si existe
    if (entry.odometerStartKm !== null && km < entry.odometerStartKm) {
      return redirectToDay(entry.unitId, 'km-end-lower');
    }
    await db
      .update(dailyEntries)
      .set({ odometerEndKm: km, updatedAt: new Date().toISOString() })
      .where(eq(dailyEntries.id, entryId));
  }

  await logAudit(ctx, {
    action: `daily_entry.odometer_${kind}`,
    target: `entry:${entryId}`,
    diff: { km },
  });

  return redirectToDay(entry.unitId);
};
