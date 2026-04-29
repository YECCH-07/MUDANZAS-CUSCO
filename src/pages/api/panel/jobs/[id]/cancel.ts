import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { jobs } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const j = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!j) return new Response('not found', { status: 404 });
  if (['completed', 'canceled'].includes(j.status)) {
    return new Response(null, {
      status: 303,
      headers: { Location: `/panel/cotizador/trabajos/${id}/` },
    });
  }
  await db
    .update(jobs)
    .set({ status: 'canceled', updatedAt: new Date().toISOString() })
    .where(eq(jobs.id, id));
  await logAudit(ctx, { action: 'job.cancel', target: `job:${id}` });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/trabajos/${id}/` },
  });
};
