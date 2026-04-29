/*
 * POST /api/panel/quotes/  → crea cotización (draft o sent).
 * Si action=send, setea status=sent + expires_at=now+15d.
 *
 * Acepta `item_label[]` y `item_amount[]` (en soles) repetidos para
 * persistir el desglose editable creado por el cotizador. Si no se envían
 * ítems pero hay plantilla, se usan los defaults de la plantilla.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { customers, quotes, quoteItems, quoteTemplates } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { nextQuoteNumber } from '@lib/panel/numbering';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z
  .object({
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
    includes_igv: z.string().optional(), // "1" | "0"
    lead_source: z.enum(['whatsapp', 'google', 'referido', 'walk-in', 'recurrente', 'otro']),
    notes: z.string().max(2000).optional().or(z.literal('')),
    action: z.enum(['draft', 'send']).default('draft'),
    template_id: z.string().optional().or(z.literal('')),
  })
  .refine((v) => v.total_soles !== undefined || v.total_cents !== undefined, {
    message: 'total required',
    path: ['total_soles'],
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
    if (k.endsWith('[]')) continue; // se procesan aparte
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
  const { fields, items: formItems } = await parseBody(ctx.request);
  const parsed = Schema.safeParse(fields);
  if (!parsed.success) return redirect('/panel/cotizador/nueva/?error=invalid');
  const data = parsed.data;

  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.id, data.customer_id))
    .get();
  if (!customer) return redirect('/panel/cotizador/nueva/?error=customer-missing');

  const id = ulid();
  const now = new Date().toISOString();
  const number = nextQuoteNumber();
  const status = data.action === 'send' ? 'sent' : 'draft';
  const expiresAt =
    status === 'sent' ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() : null;

  // Resolver plantilla (si se referencia) y sus items por defecto, sólo
  // como respaldo si el form no envió ningún ítem.
  let templateId: string | null = null;
  let templateItems: Array<{ label: string; amountCents: number }> = [];
  if (data.template_id) {
    const tpl = await db
      .select()
      .from(quoteTemplates)
      .where(eq(quoteTemplates.id, data.template_id))
      .get();
    if (tpl && tpl.active) {
      templateId = tpl.id;
      try {
        templateItems = JSON.parse(tpl.defaultItems);
      } catch {
        templateItems = [];
      }
    }
  }

  const totalCents =
    data.total_soles !== undefined ? solesToCents(data.total_soles) : (data.total_cents ?? 0);

  // Items finales: prefiere los del form (editados por el cotizador). Si no
  // hay, cae a los de la plantilla (compat con flujo antiguo).
  const itemsToInsert = formItems.length > 0 ? formItems : templateItems;

  await db.insert(quotes).values({
    id,
    number,
    customerId: customer.id,
    serviceType: data.service_type,
    templateId,
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
    includesIgv: data.includes_igv !== '0', // por defecto incluye IGV
    status,
    expiresAt,
    rejectionReason: null,
    rejectionNote: null,
    notes: data.notes || null,
    createdBy: user.id,
    createdAt: now,
    updatedAt: now,
  });

  // Insertar quote_items.
  for (let i = 0; i < itemsToInsert.length; i++) {
    const item = itemsToInsert[i]!;
    await db.insert(quoteItems).values({
      id: ulid(),
      quoteId: id,
      label: item.label,
      amountCents: item.amountCents,
      orderIdx: i,
    });
  }

  await logAudit(ctx, {
    action: `quote.${status === 'sent' ? 'send' : 'create'}`,
    target: `quote:${id}`,
    diff: {
      number,
      customer: customer.name,
      total: totalCents,
      service: data.service_type,
      itemCount: itemsToInsert.length,
      includesIgv: data.includes_igv !== '0',
    },
  });

  return redirect(`/panel/cotizador/${id}/?created=true`);
};
