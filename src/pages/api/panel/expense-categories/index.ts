import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { expenseCategories } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  slug: z.string().regex(/^[a-z0-9_-]{2,30}$/),
  label_es: z.string().trim().min(2).max(60),
  threshold_cents: z.coerce.number().int().min(0).max(100_000_000).optional(),
});

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success)
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/admin/categorias/?error=invalid' },
    });
  const data = parsed.data;

  const dupe = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.slug, data.slug))
    .get();
  if (dupe)
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/admin/categorias/?error=duplicate' },
    });

  const id = ulid();
  await db.insert(expenseCategories).values({
    id,
    slug: data.slug,
    labelEs: data.label_es,
    requiresPhotoAboveCents:
      typeof data.threshold_cents === 'number' && data.threshold_cents > 0
        ? data.threshold_cents
        : null,
    active: true,
  });

  await logAudit(ctx, {
    action: 'expense_category.create',
    target: `category:${id}`,
    diff: { slug: data.slug, label: data.label_es },
  });
  return new Response(null, {
    status: 303,
    headers: { Location: '/panel/admin/categorias/?created=true' },
  });
};
