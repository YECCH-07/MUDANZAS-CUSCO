import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { calcConfig } from '@db/schema';
import { invalidateCache } from '@lib/panel/pricing';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  if (user.role !== 'superadmin') return new Response('forbidden', { status: 403 });

  const raw = await parseBody(ctx.request);
  const rulesJson = String(raw.rules_json ?? '').trim();
  if (!rulesJson) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/admin/calculadora/?error=empty' },
    });
  }
  try {
    const parsed = JSON.parse(rulesJson);
    if (!parsed || typeof parsed !== 'object') throw new Error('not-object');
    if (!parsed.flete || !parsed.surcharges) throw new Error('missing-keys');
  } catch (err) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/panel/admin/calculadora/?error=${encodeURIComponent(String((err as Error).message))}`,
      },
    });
  }

  const now = new Date().toISOString();
  const existing = await db.select().from(calcConfig).where(eq(calcConfig.id, 'current')).get();
  if (existing) {
    await db
      .update(calcConfig)
      .set({ rulesJson, updatedBy: user.id, updatedAt: now })
      .where(eq(calcConfig.id, 'current'));
  } else {
    await db
      .insert(calcConfig)
      .values({ id: 'current', rulesJson, updatedBy: user.id, updatedAt: now });
  }
  invalidateCache();

  await logAudit(ctx, { action: 'calc.update', target: 'calc_config:current' });

  return new Response(null, {
    status: 303,
    headers: { Location: '/panel/admin/calculadora/?updated=true' },
  });
};
