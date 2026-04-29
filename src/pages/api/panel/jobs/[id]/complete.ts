import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { jobs, quotes } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const j = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!j) return new Response('not found', { status: 404 });
  if (j.status === 'completed' || j.status === 'canceled') {
    return new Response(null, {
      status: 303,
      headers: { Location: `/panel/cotizador/trabajos/${id}/` },
    });
  }
  const now = new Date().toISOString();
  await db
    .update(jobs)
    .set({ status: 'completed', completedAt: now, updatedAt: now })
    .where(eq(jobs.id, id));
  await db
    .update(quotes)
    .set({ status: 'completed', updatedAt: now })
    .where(eq(quotes.id, j.quoteId));
  await logAudit(ctx, { action: 'job.complete', target: `job:${id}` });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/trabajos/${id}/` },
  });
};
