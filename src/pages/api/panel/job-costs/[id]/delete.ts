import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { jobCosts } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const c = await db.select().from(jobCosts).where(eq(jobCosts.id, id)).get();
  if (!c) return new Response('not found', { status: 404 });
  await db.delete(jobCosts).where(eq(jobCosts.id, id));
  await logAudit(ctx, { action: 'job_cost.delete', target: `job_cost:${id}` });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/trabajos/${c.jobId}/costos/` },
  });
};
