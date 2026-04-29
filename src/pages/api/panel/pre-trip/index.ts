/*
 * POST /api/panel/pre-trip/
 * Crea el pre-trip checklist del día para una unidad del conductor.
 *
 * Regla:
 *  - El conductor solo puede crear checks para unidades que tiene asignadas
 *    (y la asignación está vigente).
 *  - Si algún ítem crítico tiene status='fail', se marca `blocker=1` y el
 *    conductor no puede registrar el día hasta que el admin lo desbloquee.
 *  - Si ya existe un check para (unit, entry_date), aborta con 409.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@db/client';
import { driverAssignments, preTripChecks } from '@db/schema';
import { PRETRIP_ITEMS } from '@lib/panel/conductor';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  unit_id: z.string().min(1),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const StatusSchema = z.enum(['ok', 'fail', 'na']);

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  if (user.role !== 'conductor' && user.role !== 'superadmin') {
    return new Response('forbidden', { status: 403 });
  }

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect('/panel/conductor/pre-trip/?error=invalid');
  }
  const { unit_id, entry_date } = parsed.data;

  // Validar que el conductor tenga asignación vigente para esa unidad.
  if (user.role === 'conductor') {
    const assignment = await db
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
    if (!assignment) {
      return new Response('not assigned to this unit', { status: 403 });
    }
  }

  // ¿Ya existe un check para hoy?
  const existing = await db
    .select()
    .from(preTripChecks)
    .where(and(eq(preTripChecks.unitId, unit_id), eq(preTripChecks.entryDate, entry_date)))
    .get();
  if (existing) {
    return redirect(`/panel/conductor/hoy/?unit=${unit_id}`);
  }

  // Parsear las respuestas: status_<key> + note_<key>
  const items: Array<{
    key: string;
    label: string;
    status: string;
    note: string;
    critical: boolean;
  }> = [];
  let hasCriticalFail = false;

  for (const item of PRETRIP_ITEMS) {
    const statusRaw = raw[`status_${item.key}`];
    const statusParsed = StatusSchema.safeParse(statusRaw);
    if (!statusParsed.success) {
      return redirect('/panel/conductor/pre-trip/?error=invalid');
    }
    const status = statusParsed.data;
    const note = String(raw[`note_${item.key}`] ?? '').trim();

    if (status === 'fail' && note.length === 0) {
      return redirect('/panel/conductor/pre-trip/?error=fail-note');
    }

    items.push({
      key: item.key,
      label: item.label,
      status,
      note,
      critical: item.critical,
    });

    if (item.critical && status === 'fail') {
      hasCriticalFail = true;
    }
  }

  const id = ulid();
  const now = new Date().toISOString();

  await db.insert(preTripChecks).values({
    id,
    unitId: unit_id,
    driverId: user.id,
    entryDate: entry_date,
    itemsJson: JSON.stringify(items),
    blocker: hasCriticalFail,
    photoKey: null,
    signedAt: now,
  });

  await logAudit(ctx, {
    action: 'pre_trip.create',
    target: `pre_trip:${id}`,
    diff: {
      unit_id,
      entry_date,
      blocker: hasCriticalFail,
      failures: items.filter((i) => i.status === 'fail').map((i) => i.key),
    },
  });

  if (hasCriticalFail) {
    return redirect(`/panel/conductor/pre-trip/?unit=${unit_id}`);
  }
  return redirect(`/panel/conductor/hoy/?unit=${unit_id}`);
};
