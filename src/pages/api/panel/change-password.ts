/*
 * POST /api/panel/change-password
 * Cambia la contraseña del usuario autenticado. Requerido en primer login
 * (flag must_change_password).
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { users, auditLog } from '@db/schema';
import { hashPassword, verifyPassword } from '@lib/auth/password';
import { destroyAllUserSessions } from '@lib/auth/session';
import { ulid } from '@lib/auth/ulid';

export const prerender = false;

const Schema = z
  .object({
    current: z.string().min(1),
    next: z.string().min(12).max(128),
    confirm: z.string().min(12).max(128),
  })
  .refine((v) => v.next === v.confirm, { message: 'mismatch', path: ['confirm'] })
  .refine((v) => v.current !== v.next, { message: 'same', path: ['next'] });

function redirectToForm(origin: string, error: string): Response {
  const url = new URL('/panel/mi-cuenta/cambiar-password/', origin);
  url.searchParams.set('error', error);
  return new Response(null, { status: 303, headers: { Location: url.toString() } });
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>;
  }
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async ({ request, locals, url, clientAddress }) => {
  const user = locals.user;
  const session = locals.session;
  if (!user || !session) {
    return new Response('no auth', { status: 401 });
  }

  const raw = await parseBody(request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const msg = firstIssue?.message ?? 'weak';
    return redirectToForm(url.origin, msg === 'mismatch' || msg === 'same' ? msg : 'weak');
  }

  // Verificar contraseña actual contra el hash guardado.
  const userRow = await db.select().from(users).where(eq(users.id, user.id)).get();
  if (!userRow) {
    return new Response('user missing', { status: 500 });
  }
  if (!(await verifyPassword(userRow.passwordHash, parsed.data.current))) {
    return redirectToForm(url.origin, 'current');
  }

  const newHash = await hashPassword(parsed.data.next);
  await db
    .update(users)
    .set({
      passwordHash: newHash,
      mustChangePassword: false,
      tempPasswordExpiresAt: null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, user.id));

  // Invalidar todas las otras sesiones del usuario por seguridad.
  await destroyAllUserSessions(user.id, session.id);

  await db.insert(auditLog).values({
    id: ulid(),
    userId: user.id,
    action: 'auth.password_change',
    target: `user:${user.id}`,
    ip: clientAddress ?? null,
    at: new Date().toISOString(),
  });

  // Redirigir al dashboard.
  const { dashboardPathFor } = await import('@lib/auth/rbac');
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(dashboardPathFor(user.role), url.origin).toString() },
  });
};
