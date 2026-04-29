import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { quotes } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const q = await db.select().from(quotes).where(eq(quotes.id, id)).get();
  if (!q) return new Response('not found', { status: 404 });
  if (['completed', 'canceled'].includes(q.status)) {
    return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
  }
  await db
    .update(quotes)
    .set({ status: 'canceled', updatedAt: new Date().toISOString() })
    .where(eq(quotes.id, id));
  await logAudit(ctx, { action: 'quote.cancel', target: `quote:${id}` });
  return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
};
