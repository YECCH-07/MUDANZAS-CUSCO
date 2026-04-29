/*
 * POST /api/panel/trips/start
 * Inicia un viaje nuevo dentro del daily_entry del conductor.
 *
 * Regla: solo puede haber un viaje "activo" (ended_at IS NULL) por daily_entry
 * a la vez. Si ya hay uno, rechaza con error 'active-exists'.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, trips } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z.object({
  entry_id: z.string().min(1),
  service_kind: z.enum(['flete', 'mudanza', 'embalaje', 'armado', 'taxi_carga', 'otro']),
  origin: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
  crew_size: z.coerce.number().int().min(1).max(20).default(1),
  customer_name: z.string().trim().max(120).optional().or(z.literal('')),
  amount_soles: z.string().optional(),
  amount_cents: z.coerce.number().int().min(0).max(100_000_000).default(0),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
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

  // ¿Hay viaje activo?
  const active = await db
    .select()
    .from(trips)
    .where(and(eq(trips.entryId, data.entry_id), isNull(trips.endedAt)))
    .get();
  if (active) {
    return redirectToDay(entry.unitId, 'trip-active');
  }

  const amountCents = data.amount_soles ? solesToCents(data.amount_soles) : data.amount_cents;

  const id = ulid();
  const now = new Date().toISOString();
  await db.insert(trips).values({
    id,
    entryId: data.entry_id,
    serviceKind: data.service_kind,
    origin: data.origin,
    destination: data.destination,
    startedAt: now,
    endedAt: null,
    crewSize: data.crew_size,
    customerName: data.customer_name ? data.customer_name : null,
    jobId: null,
    amountCents,
    notes: data.notes ? data.notes : null,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit(ctx, {
    action: 'trip.start',
    target: `trip:${id}`,
    diff: {
      entry_id: data.entry_id,
      service_kind: data.service_kind,
      origin: data.origin,
      destination: data.destination,
    },
  });

  return redirectToDay(entry.unitId);
};
