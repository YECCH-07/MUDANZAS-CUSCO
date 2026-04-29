import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { receipts } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({ reason: z.string().trim().min(4).max(200) });

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const r = await db.select().from(receipts).where(eq(receipts.id, id)).get();
  if (!r) return new Response('not found', { status: 404 });
  // Solo superadmin o el emisor original pueden anular.
  if (user.role !== 'superadmin' && r.issuedBy !== user.id) {
    return new Response('forbidden', { status: 403 });
  }
  if (r.voidedAt) {
    return new Response(null, {
      status: 303,
      headers: { Location: `/panel/cotizador/recibos/${id}/` },
    });
  }

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(null, {
      status: 303,
      headers: { Location: `/panel/cotizador/recibos/${id}/?error=invalid` },
    });
  }

  const now = new Date().toISOString();
  await db
    .update(receipts)
    .set({ voidedAt: now, voidReason: parsed.data.reason })
    .where(eq(receipts.id, id));
  await logAudit(ctx, {
    action: 'receipt.void',
    target: `receipt:${id}`,
    diff: { reason: parsed.data.reason },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/cotizador/recibos/${id}/` },
  });
};
