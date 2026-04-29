import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { quotes, jobs } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const q = await db.select().from(quotes).where(eq(quotes.id, id)).get();
  if (!q) return new Response('not found', { status: 404 });
  if (q.status !== 'sent') {
    return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
  }
  const existingJob = await db.select().from(jobs).where(eq(jobs.quoteId, id)).get();
  const now = new Date().toISOString();

  let jobId = existingJob?.id;
  if (!existingJob) {
    jobId = ulid();
    await db.insert(jobs).values({
      id: jobId,
      quoteId: id,
      assignedUnitId: null,
      assignedDriverId: null,
      scheduledDate: q.tentativeDate,
      status: 'scheduled',
      completedAt: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.update(quotes).set({ status: 'accepted', updatedAt: now }).where(eq(quotes.id, id));

  await logAudit(ctx, { action: 'quote.accept', target: `quote:${id}`, diff: { jobId } });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/trabajos/${jobId}/` },
  });
};
