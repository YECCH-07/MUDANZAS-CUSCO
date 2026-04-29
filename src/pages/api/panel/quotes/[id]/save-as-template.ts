/*
 * POST /api/panel/quotes/[id]/save-as-template
 * Crea una plantilla nueva a partir de los campos + items de una cotización
 * existente. Útil para guardar configuraciones recurrentes (ej. "Mudanza
 * estándar Wanchaq → San Sebastián, 2 personal").
 *
 * Body:
 *   - name: nombre de la plantilla (1-120 chars)
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { quotes, quoteItems, quoteTemplates } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  name: z.string().trim().min(3).max(120),
});

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

function redirect(loc: string): Response {
  return new Response(null, { status: 303, headers: { Location: loc } });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  if (user.role !== 'cotizador' && user.role !== 'superadmin') {
    return new Response('forbidden', { status: 403 });
  }

  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });

  const quote = await db.select().from(quotes).where(eq(quotes.id, id)).get();
  if (!quote) return new Response('quote not found', { status: 404 });

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect(`/panel/cotizador/${id}/?error=template-name-invalid`);
  }

  // Snapshot de campos operativos para rellenar la próxima cotización.
  const fields: Record<string, unknown> = {};
  if (quote.origin) fields.origin = quote.origin;
  if (quote.destination) fields.destination = quote.destination;
  if (typeof quote.volumeM3 === 'number') fields.volume_m3 = quote.volumeM3;
  if (typeof quote.distanceKm === 'number') fields.distance_km = quote.distanceKm;
  if (typeof quote.crewSize === 'number') fields.crew_size = quote.crewSize;
  const totalFloors = (quote.floorsOrigin ?? 0) + (quote.floorsDest ?? 0);
  if (totalFloors > 0) fields.floors = totalFloors;

  // Items actuales de la cotización como items por defecto.
  const items = await db
    .select({ label: quoteItems.label, amountCents: quoteItems.amountCents })
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id))
    .all();

  const templateId = ulid();
  const now = new Date().toISOString();

  await db.insert(quoteTemplates).values({
    id: templateId,
    name: parsed.data.name,
    serviceType: quote.serviceType,
    defaultFields: JSON.stringify(fields),
    defaultItems: JSON.stringify(items),
    createdBy: user.id,
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit(ctx, {
    action: 'quote_template.create_from_quote',
    target: `template:${templateId}`,
    diff: { name: parsed.data.name, sourceQuote: quote.number, items: items.length },
  });

  return redirect(`/panel/cotizador/plantillas/?created=true`);
};
