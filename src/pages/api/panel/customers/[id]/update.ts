import type { APIRoute } from 'astro';
import { z } from 'zod';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@db/client';
import { customers } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  doc_type: z.enum(['DNI', 'RUC', 'CE', 'Pasaporte']).optional().or(z.literal('')),
  doc_number: z.string().trim().max(20).optional().or(z.literal('')),
  tags: z.string().trim().max(200).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  blacklisted: z.string().optional(),
});

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}
function redirect(loc: string) {
  return new Response(null, { status: 303, headers: { Location: loc } });
}
function parseTags(csv: string): string[] {
  return csv
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 30);
}

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });

  const existing = await db.select().from(customers).where(eq(customers.id, id)).get();
  if (!existing) return new Response('not found', { status: 404 });

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return redirect(`/panel/cotizador/clientes/${id}/?error=invalid`);
  const data = parsed.data;

  if (data.phone && data.phone !== (existing.phone ?? '')) {
    const dupe = await db
      .select()
      .from(customers)
      .where(and(eq(customers.phone, data.phone), ne(customers.id, id)))
      .get();
    if (dupe) return redirect(`/panel/cotizador/clientes/${id}/?error=phone-dup`);
  }

  const tags = data.tags ? parseTags(data.tags) : [];
  const now = new Date().toISOString();

  await db
    .update(customers)
    .set({
      name: data.name,
      phone: data.phone ? data.phone : null,
      email: data.email ? data.email : null,
      docType: data.doc_type ? data.doc_type : null,
      docNumber: data.doc_number ? data.doc_number : null,
      tagsJson: JSON.stringify(tags),
      blacklisted: data.blacklisted === '1',
      notes: data.notes ? data.notes : null,
      updatedAt: now,
    })
    .where(eq(customers.id, id));

  await logAudit(ctx, { action: 'customer.update', target: `customer:${id}` });
  return redirect(`/panel/cotizador/clientes/${id}/?updated=true`);
};
