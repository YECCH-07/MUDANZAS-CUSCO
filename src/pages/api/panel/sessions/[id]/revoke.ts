import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { sessions } from '@db/schema';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const s = await db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!s) return new Response('not found', { status: 404 });
  // Solo permite revocar sus propias sesiones (o superadmin cualquiera).
  if (s.userId !== user.id && user.role !== 'superadmin') {
    return new Response('forbidden', { status: 403 });
  }
  await db.delete(sessions).where(eq(sessions.id, id));
  await logAudit(ctx, { action: 'session.revoke', target: `session:${id}`, diff: { ip: s.ip } });
  return new Response(null, {
    status: 303,
    headers: { Location: '/panel/mi-cuenta/?revoked=true' },
  });
};
