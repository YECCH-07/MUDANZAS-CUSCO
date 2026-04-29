import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { units, maintenanceRecords } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z
  .object({
    unit_id: z.string().min(1),
    occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    kind: z.string().min(2).max(40),
    km: z.coerce.number().int().min(0).max(9_999_999).optional(),
    amount_soles: z.string().optional(),
    amount_cents: z.coerce.number().int().min(0).max(100_000_000).optional(),
    shop: z.string().max(120).optional().or(z.literal('')),
    notes: z.string().max(500).optional().or(z.literal('')),
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
      headers: { Location: '/panel/admin/unidades/?error=invalid' },
    });
  const data = parsed.data;

  const unit = await db.select().from(units).where(eq(units.id, data.unit_id)).get();
  if (!unit) return new Response('not found', { status: 404 });

  const amountCents =
    data.amount_soles !== undefined ? solesToCents(data.amount_soles) : (data.amount_cents ?? 0);

  const id = ulid();
  await db.insert(maintenanceRecords).values({
    id,
    unitId: data.unit_id,
    occurredAt: data.occurred_at,
    km: data.km ?? null,
    kind: data.kind,
    amountCents,
    shop: data.shop || null,
    notes: data.notes || null,
    invoiceKey: null,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  });

  await logAudit(ctx, {
    action: 'maintenance.create',
    target: `maintenance:${id}`,
    diff: { unit: unit.plate, kind: data.kind, amountCents },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/admin/unidades/${data.unit_id}/mantenimiento/?created=true` },
  });
};
