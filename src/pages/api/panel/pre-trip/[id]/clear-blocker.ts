/*
 * POST /api/panel/pre-trip/[id]/clear-blocker
 * Solo superadmin. Aprueba un pre-trip bloqueado (blocker=true) y registra
 * la nota de desbloqueo + el admin que liberó la unidad.
 *
 * Después de esto el conductor puede operar normalmente con esa unidad ese día
 * (porque getDailyEntry/getPreTripCheck devuelven el row con blocker=true pero
 *  blockerClearedBy != null, que la UI del conductor interpreta como "OK").
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { preTripChecks } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  note: z.string().trim().min(3).max(500),
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
  const actor = ctx.locals.user!;
  if (actor.role !== 'superadmin') {
    return new Response('forbidden', { status: 403 });
  }

  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect(`/panel/admin/pre-trips/${id}/?error=note`);
  }

  const row = await db.select().from(preTripChecks).where(eq(preTripChecks.id, id)).get();
  if (!row) return new Response('not found', { status: 404 });

  if (!row.blocker) {
    return redirect(`/panel/admin/pre-trips/${id}/?error=not-blocked`);
  }
  if (row.blockerClearedBy) {
    return redirect(`/panel/admin/pre-trips/${id}/?error=already-cleared`);
  }

  await db
    .update(preTripChecks)
    .set({
      blockerClearedBy: actor.id,
      blockerClearNote: parsed.data.note,
    })
    .where(eq(preTripChecks.id, id));

  await logAudit(ctx, {
    action: 'pre_trip.clear_blocker',
    target: `pre_trip:${id}`,
    diff: { note: parsed.data.note },
  });

  return redirect(`/panel/admin/pre-trips/?cleared=${id}`);
};
