/*
 * POST /api/panel/trips/[id]/delete
 * Elimina un viaje (solo si el día no está cerrado).
 * Los entry_items ligados a ese trip quedan con trip_id=NULL (se liberan).
 */
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, entryItems, trips } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

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
  if (entry.closedAt !== null) {
    return redirectToDay(entry.unitId);
  }

  // Liberar entry_items ligados a este trip (quedan a nivel día).
  await db.update(entryItems).set({ tripId: null }).where(eq(entryItems.tripId, tripId));

  await db.delete(trips).where(eq(trips.id, tripId));

  await logAudit(ctx, {
    action: 'trip.delete',
    target: `trip:${tripId}`,
    diff: { origin: trip.origin, destination: trip.destination, amountCents: trip.amountCents },
  });

  return redirectToDay(entry.unitId);
};
