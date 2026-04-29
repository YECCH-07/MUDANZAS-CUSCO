/*
 * POST /api/panel/quotes/[id]/update
 * Actualiza una cotización en estado draft o sent (siempre que no haya
 * recibo emitido). Reemplaza completamente el desglose de quote_items
 * con lo que llegue en el form.
 *
 * Si el status era 'sent' y el cotizador edita, se mantiene en 'sent'
 * pero se actualiza updated_at (auditoría visible).
 *
 * Si llega action=send y el status era 'draft', cambia a 'sent' al guardar.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { quotes, quoteItems, customers, receipts } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z.object({
  customer_id: z.string().min(1),
  service_type: z.enum([
    'flete',
    'mudanza_personal',
    'mudanza_embalaje',
    'embalaje_solo',
    'armado_desarmado',
    'almacenaje',
    'solo_vehiculo_personal',
    'otro',
  ]),
  origin: z.string().max(200).optional().or(z.literal('')),
  destination: z.string().max(200).optional().or(z.literal('')),
  tentative_date: z.string().max(20).optional().or(z.literal('')),
  volume_m3: z.coerce.number().int().min(0).max(500).optional(),
  distance_km: z.coerce.number().int().min(0).max(9999).optional(),
  floors_origin: z.coerce.number().int().min(0).max(30).optional(),
  floors_dest: z.coerce.number().int().min(0).max(30).optional(),
  has_elevator: z.string().optional(),
  crew_size: z.coerce.number().int().min(1).max(20).optional(),
  total_soles: z.string().optional(),
  total_cents: z.coerce.number().int().min(0).max(100_000_000).optional(),
  use_calculator: z.string().optional(),
  includes_igv: z.string().optional(),
  lead_source: z.enum(['whatsapp', 'google', 'referido', 'walk-in', 'recurrente', 'otro']),
  notes: z.string().max(2000).optional().or(z.literal('')),
  action: z.enum(['save', 'send']).default('save'),
});

interface ParsedBody {
  fields: Record<string, unknown>;
  items: Array<{ label: string; amountCents: number }>;
}

async function parseBody(request: Request): Promise<ParsedBody> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const raw = (await request.json()) as Record<string, unknown>;
    const itemsRaw = Array.isArray(raw.items)
      ? (raw.items as Array<{ label: string; amountCents: number }>)
      : [];
    return { fields: raw, items: itemsRaw };
  }
  const fd = await request.formData();
  const fields: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (k.endsWith('[]')) continue;
    fields[k] = v;
  }
  const labels = fd.getAll('item_label[]').map((v) => String(v));
  const amounts = fd.getAll('item_amount[]').map((v) => String(v));
  const items: Array<{ label: string; amountCents: number }> = [];
  for (let i = 0; i < Math.max(labels.length, amounts.length); i++) {
    const label = (labels[i] ?? '').trim();
    const amountStr = (amounts[i] ?? '').trim();
    if (!label) continue;
    const cents = solesToCents(amountStr);
    if (cents <= 0) continue;
    items.push({ label: label.slice(0, 120), amountCents: cents });
  }
  return { fields, items };
}

function redirect(loc: string): Response {
  return new Response(null, { status: 303, headers: { Location: loc } });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });

  const existing = await db.select().from(quotes).where(eq(quotes.id, id)).get();
  if (!existing) return new Response('quote not found', { status: 404 });

  // Bloqueamos la edición si ya hay recibo emitido (la cotización es la fuente
  // de verdad del recibo y éste es inmutable).
  const hasReceipt = await db
    .select({ id: receipts.id })
    .from(receipts)
    .where(eq(receipts.quoteId, id))
    .get();
  if (hasReceipt) {
    return redirect(`/panel/cotizador/${id}/?error=has-receipt`);
  }

  // Sólo permitimos editar si está en draft o sent (no aceptada/rechazada/cancelada).
  if (!['draft', 'sent'].includes(existing.status)) {
    return redirect(`/panel/cotizador/${id}/?error=cannot-edit`);
  }

  const { fields, items: formItems } = await parseBody(ctx.request);
  const parsed = Schema.safeParse(fields);
  if (!parsed.success) return redirect(`/panel/cotizador/${id}/editar/?error=invalid`);
  const data = parsed.data;

  const customer = await db
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .where(eq(customers.id, data.customer_id))
    .get();
  if (!customer) return redirect(`/panel/cotizador/${id}/editar/?error=customer-missing`);

  const totalCents =
    data.total_soles !== undefined
      ? solesToCents(data.total_soles)
      : (data.total_cents ?? existing.totalCents);

  const now = new Date().toISOString();
  const newStatus =
    data.action === 'send' && existing.status === 'draft' ? 'sent' : existing.status;
  const expiresAt =
    newStatus === 'sent' && !existing.expiresAt
      ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      : existing.expiresAt;

  await db
    .update(quotes)
    .set({
      customerId: customer.id,
      serviceType: data.service_type,
      leadSource: data.lead_source,
      origin: data.origin || null,
      destination: data.destination || null,
      tentativeDate: data.tentative_date || null,
      volumeM3: data.volume_m3 ?? null,
      distanceKm: data.distance_km ?? null,
      floorsOrigin: data.floors_origin ?? null,
      floorsDest: data.floors_dest ?? null,
      hasElevator: data.has_elevator === '1',
      crewSize: data.crew_size ?? 2,
      totalCents,
      usedCalculator: data.use_calculator === '1',
      includesIgv: data.includes_igv !== '0',
      status: newStatus,
      expiresAt,
      notes: data.notes || null,
      updatedAt: now,
    })
    .where(eq(quotes.id, id));

  // Reemplazo total del desglose: borramos los anteriores e insertamos los nuevos.
  await db.delete(quoteItems).where(eq(quoteItems.quoteId, id));
  for (let i = 0; i < formItems.length; i++) {
    const it = formItems[i]!;
    await db.insert(quoteItems).values({
      id: ulid(),
      quoteId: id,
      label: it.label,
      amountCents: it.amountCents,
      orderIdx: i,
    });
  }

  await logAudit(ctx, {
    action: 'quote.update',
    target: `quote:${id}`,
    diff: {
      total: totalCents,
      items: formItems.length,
      status: newStatus,
      includesIgv: data.includes_igv !== '0',
      editedBy: user.id,
    },
  });

  return redirect(`/panel/cotizador/${id}/?updated=true`);
};
