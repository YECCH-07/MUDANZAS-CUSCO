/*
 * POST /api/panel/petty-cash/  → registrar movimiento.
 *
 * Calculamos saldo on-the-fly al leer (en /panel/admin/caja-chica/), pero
 * mantenemos `balance_cents` como snapshot para velocidad. Aquí lo
 * actualizamos con la operación.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@db/client';
import { pettyCashAccounts, pettyCashEntries } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';
import { solesToCents } from '@lib/panel/format';

export const prerender = false;

const Schema = z
  .object({
    account_id: z.string().min(1),
    direction: z.enum(['in', 'out']),
    amount_soles: z.string().optional(),
    amount_cents: z.coerce.number().int().min(1).max(100_000_000).optional(),
    reason: z.string().trim().min(3).max(200),
  })
  .refine((v) => v.amount_soles !== undefined || v.amount_cents !== undefined, {
    message: 'amount required',
    path: ['amount_soles'],
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
  if (!parsed.success)
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/admin/caja-chica/?error=invalid' },
    });
  const data = parsed.data;

  const account = await db
    .select()
    .from(pettyCashAccounts)
    .where(eq(pettyCashAccounts.id, data.account_id))
    .get();
  if (!account) return new Response('account not found', { status: 404 });

  const amountCents =
    data.amount_soles !== undefined ? solesToCents(data.amount_soles) : (data.amount_cents ?? 0);
  if (amountCents <= 0) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/admin/caja-chica/?error=invalid' },
    });
  }

  const id = ulid();
  await db.insert(pettyCashEntries).values({
    id,
    accountId: data.account_id,
    direction: data.direction,
    amountCents,
    reason: data.reason,
    linkedEntryItemId: null,
    linkedReceiptId: null,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  });

  // Update snapshot
  const delta = data.direction === 'in' ? amountCents : -amountCents;
  await db
    .update(pettyCashAccounts)
    .set({ balanceCents: sql`${pettyCashAccounts.balanceCents} + ${delta}` })
    .where(eq(pettyCashAccounts.id, data.account_id));

  await logAudit(ctx, {
    action: 'petty_cash.entry',
    target: `petty_cash:${id}`,
    diff: { account: account.name, direction: data.direction, amountCents, reason: data.reason },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: `/panel/admin/caja-chica/?account=${data.account_id}&created=true` },
  });
};
