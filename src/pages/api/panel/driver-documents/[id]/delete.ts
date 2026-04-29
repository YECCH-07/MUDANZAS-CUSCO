import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { driverDocuments } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const doc = await db.select().from(driverDocuments).where(eq(driverDocuments.id, id)).get();
  if (!doc) return new Response('not found', { status: 404 });
  await db.delete(driverDocuments).where(eq(driverDocuments.id, id));
  await logAudit(ctx, {
    action: 'driver_document.delete',
    target: `driver_doc:${id}`,
    diff: { kind: doc.kind },
  });
  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/admin/usuarios/${doc.userId}/documentos/?deleted=true` },
  });
};
