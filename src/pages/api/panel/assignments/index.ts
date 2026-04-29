/*
 * POST /api/panel/assignments/
 * Crea una asignación conductor ↔ unidad.
 * Regla: la unidad no puede tener otra asignación vigente (ends_at IS NULL).
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@db/client';
import { users, units, driverAssignments } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  user_id: z.string().min(1),
  unit_id: z.string().min(1),
  starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato yyyy-mm-dd'),
});

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
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect('/panel/admin/asignaciones/nueva/?error=invalid');
  }
  const { user_id, unit_id, starts_at } = parsed.data;

  // Validar conductor activo.
  const driver = await db.select().from(users).where(eq(users.id, user_id)).get();
  if (!driver || !driver.active || driver.role !== 'conductor') {
    return redirect('/panel/admin/asignaciones/nueva/?error=driver-missing');
  }

  // Validar unidad activa.
  const unit = await db.select().from(units).where(eq(units.id, unit_id)).get();
  if (!unit || !unit.active) {
    return redirect('/panel/admin/asignaciones/nueva/?error=unit-missing');
  }

  // ¿Ya hay vigente para esta unidad?
  const busy = await db
    .select()
    .from(driverAssignments)
    .where(and(eq(driverAssignments.unitId, unit_id), isNull(driverAssignments.endsAt)))
    .get();
  if (busy) {
    return redirect('/panel/admin/asignaciones/nueva/?error=unit-busy');
  }

  const id = ulid();
  await db.insert(driverAssignments).values({
    id,
    userId: user_id,
    unitId: unit_id,
    startsAt: starts_at,
    endsAt: null,
  });

  await logAudit(ctx, {
    action: 'assignment.create',
    target: `assignment:${id}`,
    diff: { driver: driver.email, unit: unit.plate, startsAt: starts_at },
  });

  return redirect('/panel/admin/asignaciones/?created=true');
};
