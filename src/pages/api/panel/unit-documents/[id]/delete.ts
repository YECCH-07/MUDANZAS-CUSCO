import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { unitDocuments } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const doc = await db.select().from(unitDocuments).where(eq(unitDocuments.id, id)).get();
  if (!doc) return new Response('not found', { status: 404 });

  await db.delete(unitDocuments).where(eq(unitDocuments.id, id));
  await logAudit(ctx, {
    action: 'unit_document.delete',
    target: `unit_doc:${id}`,
    diff: { kind: doc.kind },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/admin/unidades/${doc.unitId}/documentos/?deleted=true` },
  });
};
