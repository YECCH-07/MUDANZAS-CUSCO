/*
 * POST /api/panel/entry-items/[id]/delete
 * Elimina un ítem (mientras el día esté abierto).
 */
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, entryItems } from '@db/schema';
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
  const itemId = ctx.params.id;
  if (!itemId) return new Response('missing id', { status: 400 });

  const item = await db.select().from(entryItems).where(eq(entryItems.id, itemId)).get();
  if (!item) return new Response('not found', { status: 404 });

  const entry = await db.select().from(dailyEntries).where(eq(dailyEntries.id, item.entryId)).get();
  if (!entry) return new Response('entry missing', { status: 500 });

  if (user.role === 'conductor' && entry.driverId !== user.id) {
    return new Response('forbidden', { status: 403 });
  }
  if (entry.closedAt !== null) {
    return new Response(JSON.stringify({ ok: false, error: 'day-closed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await db.delete(entryItems).where(eq(entryItems.id, itemId));

  await logAudit(ctx, {
    action: 'entry_item.delete',
    target: `item:${itemId}`,
    diff: { amountCents: item.amountCents, kind: item.kind },
  });

  return redirectToDay(entry.unitId);
};
