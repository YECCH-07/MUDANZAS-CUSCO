/*
 * POST /api/panel/units/[id]/update
 * Actualiza una unidad. Usamos POST (no PATCH) para que el <form> HTML
 * funcione sin JS.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@db/client';
import { units } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  plate: z
    .string()
    .trim()
    .toUpperCase()
    .min(5)
    .max(10)
    .regex(/^[A-Z0-9-]+$/, 'Formato de placa inválido'),
  tonnage: z.coerce
    .number()
    .int()
    .refine((n) => [1, 2, 4].includes(n)),
  alias: z.string().trim().max(50).optional().or(z.literal('')),
  soat_expires: z.string().trim().optional().or(z.literal('')),
  rtv_expires: z.string().trim().optional().or(z.literal('')),
  next_service_km: z.coerce.number().int().min(0).max(9_999_999).optional().or(z.literal('')),
  active: z.string().optional(), // '1' si checked
});

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });

  const existing = await db.select().from(units).where(eq(units.id, id)).get();
  if (!existing) return new Response('unit not found', { status: 404 });

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect(`/panel/admin/unidades/${id}/?error=invalid`);
  }
  const data = parsed.data;

  // ¿La nueva placa duplica otra unidad?
  if (data.plate !== existing.plate) {
    const dupe = await db
      .select()
      .from(units)
      .where(and(eq(units.plate, data.plate), ne(units.id, id)))
      .get();
    if (dupe) {
      return redirect(`/panel/admin/unidades/${id}/?error=duplicate`);
    }
  }

  const nextSvc = typeof data.next_service_km === 'number' ? data.next_service_km : null;

  const now = new Date().toISOString();
  await db
    .update(units)
    .set({
      plate: data.plate,
      tonnage: data.tonnage,
      alias: data.alias ? data.alias : null,
      soatExpires: data.soat_expires ? data.soat_expires : null,
      rtvExpires: data.rtv_expires ? data.rtv_expires : null,
      nextServiceKm: nextSvc,
      active: data.active === '1',
      updatedAt: now,
    })
    .where(eq(units.id, id));

  await logAudit(ctx, {
    action: 'unit.update',
    target: `unit:${id}`,
    diff: {
      before: {
        plate: existing.plate,
        tonnage: existing.tonnage,
        alias: existing.alias,
        active: existing.active,
        soatExpires: existing.soatExpires,
        rtvExpires: existing.rtvExpires,
      },
      after: {
        plate: data.plate,
        tonnage: data.tonnage,
        alias: data.alias || null,
        active: data.active === '1',
        soatExpires: data.soat_expires || null,
        rtvExpires: data.rtv_expires || null,
      },
    },
  });

  return redirect(`/panel/admin/unidades/${id}/?updated=true`);
};
