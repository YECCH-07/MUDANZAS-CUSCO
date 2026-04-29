/*
 * POST /api/panel/trips/[id]/end
 * Finaliza un viaje activo: setea ended_at + confirma amount_cents.
 *
 * Body (opcional):
 *  - amount_cents: monto final cobrado (pisa el inicial si difiere)
 *  - notes: notas finales
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, trips } from '@db/schema';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z.object({
  amount_soles: z.string().optional(),
  amount_cents: z.coerce.number().int().min(0).max(100_000_000).optional(),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

function redirectToDay(unitId: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/conductor/hoy/?unit=${encodeURIComponent(unitId)}` },
  });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const tripId = ctx.params.id;
  if (!tripId) return new Response('missing id', { status: 400 });

  const trip = await db.select().from(trips).where(eq(trips.id, tripId)).get();
  if (!trip) return new Response('trip not found', { status: 404 });

  const entry = await db.select().from(dailyEntries).where(eq(dailyEntries.id, trip.entryId)).get();
  if (!entry) return new Response('entry missing', { status: 500 });

  if (user.role === 'conductor' && entry.driverId !== user.id) {
    return new Response('forbidden', { status: 403 });
  }
  if (trip.endedAt !== null) {
    return redirectToDay(entry.unitId);
  }

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { amount_soles, amount_cents, notes } = parsed.data;

  const finalCents = amount_soles
    ? solesToCents(amount_soles)
    : typeof amount_cents === 'number'
      ? amount_cents
      : undefined;

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    endedAt: now,
    updatedAt: now,
  };
  if (typeof finalCents === 'number') updates.amountCents = finalCents;
  if (typeof notes === 'string' && notes.length > 0) updates.notes = notes;

  await db.update(trips).set(updates).where(eq(trips.id, tripId));

  await logAudit(ctx, {
    action: 'trip.end',
    target: `trip:${tripId}`,
    diff: {
      durationSec: Math.round((Date.now() - new Date(trip.startedAt).getTime()) / 1000),
      amountCents: updates.amountCents ?? trip.amountCents,
    },
  });

  return redirectToDay(entry.unitId);
};
