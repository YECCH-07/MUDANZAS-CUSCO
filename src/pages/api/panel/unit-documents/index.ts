/*
 * POST /api/panel/unit-documents/  → registra un documento subido a B2.
 *
 * El cliente sube primero a B2 (PhotoUploader) y obtiene `file_key`. Este
 * endpoint solo persiste la metadata (asume que el archivo ya está en B2).
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { units, unitDocuments } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  unit_id: z.string().min(1),
  kind: z.enum(['soat', 'rtv', 'tarjeta_propiedad', 'seguro', 'poliza', 'otro']),
  file_key: z.string().min(1),
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
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
  if (!parsed.success) {
    return new Response(null, {
      status: 303,
      headers: { Location: `/panel/admin/unidades/?error=invalid` },
    });
  }
  const data = parsed.data;

  const unit = await db.select().from(units).where(eq(units.id, data.unit_id)).get();
  if (!unit) return new Response('unit not found', { status: 404 });

  const id = ulid();
  await db.insert(unitDocuments).values({
    id,
    unitId: data.unit_id,
    kind: data.kind,
    fileKey: data.file_key,
    validUntil: data.valid_until || null,
    notes: data.notes || null,
    uploadedBy: user.id,
    uploadedAt: new Date().toISOString(),
  });

  // Si es SOAT/RTV, sincronizar con `units.soat_expires` / `rtv_expires` para
  // que las alertas del dashboard se mantengan consistentes.
  if (data.valid_until) {
    if (data.kind === 'soat') {
      await db
        .update(units)
        .set({ soatExpires: data.valid_until })
        .where(eq(units.id, data.unit_id));
    } else if (data.kind === 'rtv') {
      await db
        .update(units)
        .set({ rtvExpires: data.valid_until })
        .where(eq(units.id, data.unit_id));
    }
  }

  await logAudit(ctx, {
    action: 'unit_document.create',
    target: `unit_doc:${id}`,
    diff: { unit: unit.plate, kind: data.kind, validUntil: data.valid_until },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/admin/unidades/${data.unit_id}/documentos/?created=true` },
  });
};
