/*
 * POST /api/panel/units/
 * Crea una unidad. Solo superadmin (validado por middleware/RBAC).
 *
 * Acepta:
 *  - form data (redirect 303)
 *  - JSON con Accept: application/json (devuelve JSON)
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { units } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
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
    .refine((n) => [1, 2, 4].includes(n), 'Tonelaje inválido'),
  alias: z.string().trim().max(50).optional().or(z.literal('')),
  soat_expires: z.string().trim().optional().or(z.literal('')),
  rtv_expires: z.string().trim().optional().or(z.literal('')),
  next_service_km: z.coerce.number().int().min(0).max(9_999_999).optional().or(z.literal('')),
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
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect('/panel/admin/unidades/nueva/?error=invalid');
  }
  const data = parsed.data;

  // Duplicado por placa?
  const dupe = await db.select().from(units).where(eq(units.plate, data.plate)).get();
  if (dupe) {
    return redirect('/panel/admin/unidades/nueva/?error=duplicate');
  }

  const id = ulid();
  const now = new Date().toISOString();
  await db.insert(units).values({
    id,
    plate: data.plate,
    tonnage: data.tonnage,
    alias: data.alias ? data.alias : null,
    soatExpires: data.soat_expires ? data.soat_expires : null,
    rtvExpires: data.rtv_expires ? data.rtv_expires : null,
    nextServiceKm: typeof data.next_service_km === 'number' ? data.next_service_km : null,
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit(ctx, {
    action: 'unit.create',
    target: `unit:${id}`,
    diff: { plate: data.plate, tonnage: data.tonnage },
  });

  const wantsJson = ctx.request.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true, id, plate: data.plate }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return redirect(`/panel/admin/unidades/?created=${encodeURIComponent(data.plate)}`);
};
