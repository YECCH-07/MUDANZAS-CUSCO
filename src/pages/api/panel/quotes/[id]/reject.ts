import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { quotes } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  reason: z.enum(['precio', 'fecha', 'competidor', 'sin-respuesta', 'otro']),
  note: z.string().trim().max(500).optional().or(z.literal('')),
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
  const q = await db.select().from(quotes).where(eq(quotes.id, id)).get();
  if (!q) return new Response('not found', { status: 404 });
  if (!['draft', 'sent'].includes(q.status)) {
    return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
  }
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
  }
  const { reason, note } = parsed.data;
  if (reason === 'otro' && !note) {
    return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
  }
  await db
    .update(quotes)
    .set({
      status: 'rejected',
      rejectionReason: reason,
      rejectionNote: note || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(quotes.id, id));
  await logAudit(ctx, { action: 'quote.reject', target: `quote:${id}`, diff: { reason, note } });
  return new Response(null, { status: 303, headers: { Location: `/panel/cotizador/${id}/` } });
};
