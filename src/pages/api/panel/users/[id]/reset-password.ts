/*
 * POST /api/panel/users/[id]/reset-password
 * Genera nueva contraseña temporal (24h) y la entrega vía query string
 * para mostrarla UNA vez al admin. Solo superadmin.
 */
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { users, sessions } from '@db/schema';
import { hashPassword, generateTempPassword } from '@lib/auth/password';
import { logAudit } from '@lib/panel/audit';
import { sendMail, TEMPLATES } from '@lib/panel/email';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const actor = ctx.locals.user!;
  if (actor.role !== 'superadmin') return new Response('forbidden', { status: 403 });

  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });
  const target = await db.select().from(users).where(eq(users.id, id)).get();
  if (!target) return new Response('not found', { status: 404 });

  const tempPw = generateTempPassword();
  const hashStr = await hashPassword(tempPw);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  await db
    .update(users)
    .set({
      passwordHash: hashStr,
      mustChangePassword: true,
      tempPasswordExpiresAt: expires,
      updatedAt: now,
    })
    .where(eq(users.id, id));

  // Invalida cualquier sesión existente del usuario.
  await db.delete(sessions).where(eq(sessions.userId, id));

  await logAudit(ctx, { action: 'user.reset_password', target: `user:${id}` });

  const tpl = TEMPLATES.passwordReset({
    name: target.fullName,
    tempPassword: tempPw,
    loginUrl: `${ctx.url.origin}/panel/login/`,
  });
  void sendMail({ to: target.email, subject: tpl.subject, html: tpl.html });

  const url = new URL(`/panel/admin/usuarios/`, ctx.url.origin);
  url.searchParams.set('reset', target.email);
  url.searchParams.set('pw', tempPw);
  return new Response(null, { status: 303, headers: { Location: url.toString() } });
};
