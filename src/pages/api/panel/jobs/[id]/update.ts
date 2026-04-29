import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { jobs } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  unit_id: z.string().optional().or(z.literal('')),
  driver_id: z.string().optional().or(z.literal('')),
  scheduled_date: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const job = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) return new Response('not found', { status: 404 });

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(null, {
      status: 303,
      headers: { Location: `/panel/cotizador/trabajos/${id}/?error=invalid` },
    });
  }

  await db
    .update(jobs)
    .set({
      assignedUnitId: parsed.data.unit_id || null,
      assignedDriverId: parsed.data.driver_id || null,
      scheduledDate: parsed.data.scheduled_date || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(jobs.id, id));

  await logAudit(ctx, { action: 'job.update', target: `job:${id}` });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/trabajos/${id}/?updated=true` },
  });
};
