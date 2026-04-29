import type { APIRoute } from 'astro';
import { destroyAllUserSessions } from '@lib/auth/session';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const session = ctx.locals.session!;
  await destroyAllUserSessions(user.id, session.id);
  await logAudit(ctx, { action: 'session.revoke_others', target: `user:${user.id}` });
  return new Response(null, {
    status: 303,
    headers: { Location: '/panel/mi-cuenta/?revoked-all=true' },
  });
};
