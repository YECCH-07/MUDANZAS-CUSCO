import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { expenseCategories } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const c = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id)).get();
  if (!c) return new Response('not found', { status: 404 });
  await db.update(expenseCategories).set({ active: !c.active }).where(eq(expenseCategories.id, id));
  await logAudit(ctx, {
    action: 'expense_category.toggle',
    target: `category:${id}`,
    diff: { active: !c.active },
  });
  return new Response(null, {
    status: 303,
    headers: { Location: '/panel/admin/categorias/?updated=true' },
  });
};
