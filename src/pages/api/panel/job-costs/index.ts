import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { jobs, jobCosts } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z
  .object({
    job_id: z.string().min(1),
    category_id: z.string().optional().or(z.literal('')),
    amount_soles: z.string().optional(),
    amount_cents: z.coerce.number().int().min(0).max(100_000_000).optional(),
    description: z.string().trim().min(3).max(200),
  })
  .refine((v) => v.amount_soles !== undefined || v.amount_cents !== undefined, {
    message: 'amount required',
    path: ['amount_soles'],
  });

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success)
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/cotizador/trabajos/?error=invalid' },
    });
  const data = parsed.data;

  const job = await db.select().from(jobs).where(eq(jobs.id, data.job_id)).get();
  if (!job) return new Response('not found', { status: 404 });

  const amountCents =
    data.amount_soles !== undefined ? solesToCents(data.amount_soles) : (data.amount_cents ?? 0);

  const id = ulid();
  await db.insert(jobCosts).values({
    id,
    jobId: data.job_id,
    categoryId: data.category_id || null,
    amountCents,
    description: data.description,
    photoKey: null,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  });

  await logAudit(ctx, {
    action: 'job_cost.create',
    target: `job_cost:${id}`,
    diff: { jobId: data.job_id, amount: amountCents },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/trabajos/${data.job_id}/costos/?created=true` },
  });
};
