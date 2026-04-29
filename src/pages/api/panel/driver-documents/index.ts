import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { users, driverDocuments } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  user_id: z.string().min(1),
  kind: z.enum(['licencia', 'dni', 'record_policial', 'certificado_medico', 'contrato', 'otro']),
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
  const actor = ctx.locals.user!;
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success)
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/admin/usuarios/?error=invalid' },
    });
  const data = parsed.data;

  const target = await db.select().from(users).where(eq(users.id, data.user_id)).get();
  if (!target) return new Response('not found', { status: 404 });

  const id = ulid();
  await db.insert(driverDocuments).values({
    id,
    userId: data.user_id,
    kind: data.kind,
    fileKey: data.file_key,
    validUntil: data.valid_until || null,
    notes: data.notes || null,
    uploadedBy: actor.id,
    uploadedAt: new Date().toISOString(),
  });

  await logAudit(ctx, {
    action: 'driver_document.create',
    target: `driver_doc:${id}`,
    diff: { user: target.email, kind: data.kind, validUntil: data.valid_until },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/admin/usuarios/${data.user_id}/documentos/?created=true` },
  });
};
