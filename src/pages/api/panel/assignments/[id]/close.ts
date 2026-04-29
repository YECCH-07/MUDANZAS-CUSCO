/*
 * POST /api/panel/assignments/[id]/close
 * Cierra una asignación (setea ends_at = hoy).
 */
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { driverAssignments } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });

  const row = await db.select().from(driverAssignments).where(eq(driverAssignments.id, id)).get();
  if (!row) return new Response('not found', { status: 404 });

  if (row.endsAt !== null) {
    // Ya cerrada — idempotente, solo redirige.
    return redirect('/panel/admin/asignaciones/?closed=true');
  }

  const today = new Date().toISOString().slice(0, 10);
  await db.update(driverAssignments).set({ endsAt: today }).where(eq(driverAssignments.id, id));

  await logAudit(ctx, {
    action: 'assignment.close',
    target: `assignment:${id}`,
    diff: { closedAt: today },
  });

  return redirect('/panel/admin/asignaciones/?closed=true');
};
