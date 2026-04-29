/*
 * POST /api/panel/quote-templates/  → crea plantilla.
 *
 * `items_csv` es texto multilinea, una línea por ítem. Formato:
 *   "Tarifa base | 200.00"
 *   "Volumen 8 m3 | 240.00"
 * Los montos se interpretan como soles (acepta entero o decimal con punto/coma).
 *
 * Se serializa a JSON antes de guardar en `default_items` (en céntimos internos).
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db } from '@db/client';
import { quoteTemplates } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

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
});

export interface ParsedItem {
  label: string;
  amountCents: number;
}

export function parseItemsCsv(csv: string): ParsedItem[] {
  if (!csv.trim()) return [];
  return csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [labelRaw, amountRaw] = line.split('|').map((s) => s.trim());
      // Acepta soles con decimales: "200" o "200.50" o "200,50".
      const soles = Number((amountRaw ?? '').replace(',', '.'));
      if (!labelRaw || !Number.isFinite(soles) || soles < 0) return null;
      return { label: labelRaw, amountCents: Math.round(soles * 100) };
    })
    .filter((x): x is ParsedItem => x !== null);
}

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}
function redirect(loc: string) {
  return new Response(null, { status: 303, headers: { Location: loc } });
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  if (user.role !== 'cotizador' && user.role !== 'superadmin')
    return new Response('forbidden', { status: 403 });

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return redirect('/panel/cotizador/plantillas/nueva/?error=invalid');
  const data = parsed.data;

  const id = ulid();
  const now = new Date().toISOString();
  const fields: Record<string, unknown> = {};
  if (data.origin) fields.origin = data.origin;
  if (data.destination) fields.destination = data.destination;
  if (typeof data.volume_m3 === 'number') fields.volume_m3 = data.volume_m3;
  if (typeof data.distance_km === 'number') fields.distance_km = data.distance_km;
  if (typeof data.crew_size === 'number') fields.crew_size = data.crew_size;
  if (typeof data.floors === 'number') fields.floors = data.floors;

  const items = data.items_csv ? parseItemsCsv(data.items_csv) : [];

  await db.insert(quoteTemplates).values({
    id,
    name: data.name,
    serviceType: data.service_type,
    defaultFields: JSON.stringify(fields),
    defaultItems: JSON.stringify(items),
    createdBy: user.id,
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit(ctx, {
    action: 'quote_template.create',
    target: `template:${id}`,
    diff: { name: data.name },
  });

  return redirect('/panel/cotizador/plantillas/?created=true');
};
