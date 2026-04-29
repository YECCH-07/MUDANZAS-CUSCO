import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { quoteTemplates } from '@db/schema';
import { logAudit } from '@lib/panel/audit';
import { parseItemsCsv } from '../index';

export const prerender = false;

const Schema = z.object({
  name: z.string().trim().min(3).max(120),
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
  origin: z.string().trim().max(120).optional().or(z.literal('')),
  destination: z.string().trim().max(120).optional().or(z.literal('')),
  volume_m3: z.coerce.number().int().min(0).max(500).optional(),
  distance_km: z.coerce.number().int().min(0).max(9999).optional(),
  crew_size: z.coerce.number().int().min(1).max(20).optional(),
  floors: z.coerce.number().int().min(0).max(30).optional(),
  items_csv: z.string().max(5000).optional().or(z.literal('')),
  active: z.string().optional(),
});

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const existing = await db.select().from(quoteTemplates).where(eq(quoteTemplates.id, id)).get();
  if (!existing) return new Response('not found', { status: 404 });

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(null, {
      status: 303,
      headers: { Location: `/panel/cotizador/plantillas/${id}/?error=invalid` },
    });
  }
  const data = parsed.data;
  const fields: Record<string, unknown> = {};
  if (data.origin) fields.origin = data.origin;
  if (data.destination) fields.destination = data.destination;
  if (typeof data.volume_m3 === 'number') fields.volume_m3 = data.volume_m3;
  if (typeof data.distance_km === 'number') fields.distance_km = data.distance_km;
  if (typeof data.crew_size === 'number') fields.crew_size = data.crew_size;
  if (typeof data.floors === 'number') fields.floors = data.floors;

  const items = data.items_csv ? parseItemsCsv(data.items_csv) : [];

  await db
    .update(quoteTemplates)
    .set({
      name: data.name,
      serviceType: data.service_type,
      defaultFields: JSON.stringify(fields),
      defaultItems: JSON.stringify(items),
      active: data.active === '1',
      updatedAt: new Date().toISOString(),
    })
    .where(eq(quoteTemplates.id, id));

  await logAudit(ctx, { action: 'quote_template.update', target: `template:${id}` });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/plantillas/?updated=true` },
  });
};
