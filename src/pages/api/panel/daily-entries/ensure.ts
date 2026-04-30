/*
 * POST /api/panel/daily-entries/ensure
 * Idempotente: crea `daily_entries` para (unit_id, entry_date) si no existe
 * y devuelve el id (JSON o redirect según Accept).
 *
 * Precondición: el conductor debe tener `driver_assignments` vigente para la
 * unidad, y existir un `pre_trip_checks` del día que NO esté bloqueado.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, driverAssignments, preTripChecks } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  unit_id: z.string().min(1),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  if (user.role !== 'conductor' && user.role !== 'superadmin') {
    return new Response('forbidden', { status: 403 });
  }

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { unit_id, entry_date } = parsed.data;

  // Validar asignación vigente (superadmin puede saltar para fines de QA).
  let driverId = user.id;
  if (user.role === 'conductor') {
    const a = await db
      .select()
      .from(driverAssignments)
      .where(
        and(
          eq(driverAssignments.userId, user.id),
          eq(driverAssignments.unitId, unit_id),
          isNull(driverAssignments.endsAt),
        ),
      )
      .get();
    if (!a) {
      return new Response(JSON.stringify({ ok: false, error: 'not-assigned' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    // superadmin: buscamos un conductor asignado a la unidad para atribuir.
    const a = await db
      .select()
      .from(driverAssignments)
      .where(and(eq(driverAssignments.unitId, unit_id), isNull(driverAssignments.endsAt)))
      .get();
    driverId = a?.userId ?? user.id;
  }

  // Pre-trip OK?
  const check = await db
    .select()
    .from(preTripChecks)
    .where(and(eq(preTripChecks.unitId, unit_id), eq(preTripChecks.entryDate, entry_date)))
    .get();
  if (!check) {
    return new Response(JSON.stringify({ ok: false, error: 'pretrip-missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Solo rechazar si el blocker sigue activo (no aprobado por admin todavía).
  if (check.blocker && !check.blockerClearedBy) {
    return new Response(JSON.stringify({ ok: false, error: 'pretrip-blocker' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ¿Ya existe?
  const existing = await db
    .select()
    .from(dailyEntries)
    .where(and(eq(dailyEntries.unitId, unit_id), eq(dailyEntries.entryDate, entry_date)))
    .get();
  if (existing) {
    return new Response(JSON.stringify({ ok: true, id: existing.id, created: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Crear.
  const id = ulid();
  const now = new Date().toISOString();
  await db.insert(dailyEntries).values({
    id,
    unitId: unit_id,
    driverId,
    entryDate: entry_date,
    odometerStartKm: null,
    odometerEndKm: null,
    preTripCheckId: check.id,
    closedAt: null,
    notes: null,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit(ctx, {
    action: 'daily_entry.create',
    target: `entry:${id}`,
    diff: { unit_id, entry_date, driverId },
  });

  return new Response(JSON.stringify({ ok: true, id, created: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
