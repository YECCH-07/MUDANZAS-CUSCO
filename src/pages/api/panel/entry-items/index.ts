/*
 * POST /api/panel/entry-items/
 * Añade un ítem (ingreso suelto o gasto) al daily_entry.
 *
 * Reglas:
 *  - Solo el conductor dueño del daily_entry o superadmin.
 *  - No se puede añadir si el día ya está cerrado.
 *  - Si kind='expense': `category_id` obligatorio.
 *  - Si la categoría tiene `requires_photo_above_cents` y el monto lo supera,
 *    `photo_key` es obligatorio.
 *
 * La foto se sube primero con presigned URL (ver endpoint upload-url) y se
 * referencia aquí por su `photo_key` en el bucket de fotos operativas.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, entryItems, expenseCategories, trips } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z
  .object({
    entry_id: z.string().min(1),
    kind: z.enum(['income', 'expense']),
    category_id: z.string().optional().or(z.literal('')),
    amount_soles: z.string().optional(),
    amount_cents: z.coerce.number().int().min(0).max(100_000_000).optional(),
    description: z.string().trim().min(1).max(500),
    trip_id: z.string().optional().or(z.literal('')),
    photo_key: z.string().optional().or(z.literal('')),
  })
  .refine((v) => v.kind === 'income' || (v.category_id && v.category_id.length > 0), {
    message: 'category_id required for expenses',
    path: ['category_id'],
  })
  .refine((v) => v.amount_soles !== undefined || v.amount_cents !== undefined, {
    message: 'amount_soles or amount_cents required',
    path: ['amount_soles'],
  });

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

function redirectToDay(unitId: string, error?: string): Response {
  const params = new URLSearchParams({ unit: unitId, ...(error ? { error } : {}) });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/conductor/hoy/?${params.toString()}` },
  });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid', issues: parsed.error.issues }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const data = parsed.data;

  const entry = await db
    .select()
    .from(dailyEntries)
    .where(eq(dailyEntries.id, data.entry_id))
    .get();
  if (!entry) return new Response('entry not found', { status: 404 });
  if (user.role === 'conductor' && entry.driverId !== user.id) {
    return new Response('forbidden', { status: 403 });
  }
  if (entry.closedAt !== null) {
    return redirectToDay(entry.unitId, 'day-closed');
  }

  // Si trip_id se provee, validar que pertenece al entry.
  if (data.trip_id) {
    const trip = await db.select().from(trips).where(eq(trips.id, data.trip_id)).get();
    if (!trip || trip.entryId !== data.entry_id) {
      return redirectToDay(entry.unitId, 'trip-mismatch');
    }
  }

  const amountCents =
    data.amount_soles !== undefined ? solesToCents(data.amount_soles) : (data.amount_cents ?? 0);

  // Si es gasto: validar categoría + umbral de foto obligatoria.
  let categoryId: string | null = null;
  if (data.kind === 'expense') {
    const cat = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.id, data.category_id!))
      .get();
    if (!cat || !cat.active) {
      return redirectToDay(entry.unitId, 'category-invalid');
    }
    if (
      cat.requiresPhotoAboveCents !== null &&
      amountCents >= cat.requiresPhotoAboveCents &&
      !data.photo_key
    ) {
      return redirectToDay(entry.unitId, 'photo-required');
    }
    categoryId = cat.id;
  }

  const id = ulid();
  const now = new Date().toISOString();
  await db.insert(entryItems).values({
    id,
    entryId: data.entry_id,
    tripId: data.trip_id ? data.trip_id : null,
    kind: data.kind,
    categoryId,
    amountCents,
    description: data.description,
    occurredAt: now,
    photoKey: data.photo_key ? data.photo_key : null,
    createdAt: now,
  });

  await logAudit(ctx, {
    action: `entry_item.${data.kind}`,
    target: `item:${id}`,
    diff: {
      entry_id: data.entry_id,
      amountCents,
      categoryId,
      hasPhoto: !!data.photo_key,
    },
  });

  return redirectToDay(entry.unitId);
};
