import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { pettyCashAccounts } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({ name: z.string().trim().min(3).max(80) });

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
      headers: { Location: '/panel/admin/caja-chica/cuentas/nueva/?error=invalid' },
    });
  const dupe = await db
    .select()
    .from(pettyCashAccounts)
    .where(eq(pettyCashAccounts.name, parsed.data.name))
    .get();
  if (dupe)
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/admin/caja-chica/cuentas/nueva/?error=duplicate' },
    });

  const id = ulid();
  await db.insert(pettyCashAccounts).values({
    id,
    name: parsed.data.name,
    balanceCents: 0,
    active: true,
    createdAt: new Date().toISOString(),
  });
  await logAudit(ctx, {
    action: 'petty_cash_account.create',
    target: `account:${id}`,
    diff: { name: parsed.data.name },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/admin/caja-chica/?account=${id}` },
  });
};
