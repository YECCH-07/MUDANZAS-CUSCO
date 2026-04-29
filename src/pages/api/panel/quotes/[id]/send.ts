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
  if (q.status !== 'draft') {
    return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
  }
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .update(quotes)
    .set({ status: 'sent', expiresAt, updatedAt: now })
    .where(eq(quotes.id, id));
  await logAudit(ctx, { action: 'quote.send', target: `quote:${id}` });
  return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
};
