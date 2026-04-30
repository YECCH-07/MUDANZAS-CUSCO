/*
 * POST /api/panel/login
 *
 * Acepta form data o JSON con { email, password, next? }.
 * Flujo:
 *   1. Validar schema con Zod
 *   2. Chequear rate limit (tabla login_attempts)
 *   3. Buscar usuario por email (case-insensitive)
 *   4. Verificar password con Argon2
 *   5. Crear sesión en DB + setear cookie
 *   6. Registrar audit_log
 *   7. Redirigir a `next` o al dashboard del rol
 *
 * Respuesta: HTTP 303 redirect (para funcionar sin JS). Si la request declara
 * `Accept: application/json`, devuelve JSON.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { users, auditLog } from '@db/schema';
import { verifyPassword } from '@lib/auth/password';
import { createSession, setSessionCookie } from '@lib/auth/session';
import { isLoginBlocked, recordLoginAttempt } from '@lib/auth/rate-limit';
import { dashboardPathFor } from '@lib/auth/rbac';
import { ulid } from '@lib/auth/ulid';

export const prerender = false;

const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  next: z.string().optional(),
});

function redirectTo(location: string, status = 303): Response {
  return new Response(null, {
    status,
    headers: { Location: location },
  });
}

function fail(
  request: Request,
  url: URL,
  code: 'invalid' | 'rate' | 'expired' | 'inactive',
): Response {
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: false, error: code }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Redirect relativo: el navegador lo resuelve contra la URL actual. Evita que
  // detrás de un reverse proxy (LiteSpeed/Nginx) Astro construya un Location
  // absoluto con el origin interno (http://localhost:3000) en vez del público.
  const params = new URLSearchParams();
  params.set('error', code);
  const next = url.searchParams.get('next');
  if (next) params.set('next', next);
  return redirectTo(`/panel/login/?${params.toString()}`);
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>;
  }
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async ({ request, cookies, clientAddress, url }) => {
  const raw = await parseBody(request);
  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(request, url, 'invalid');
  }
  const { email, password } = parsed.data;
  const ip = clientAddress ?? null;

  if (await isLoginBlocked(email, ip)) {
    return fail(request, url, 'rate');
  }

  const user = await db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    await recordLoginAttempt(email, ip, false);
    return fail(request, url, 'invalid');
  }

  if (!user.active) {
    await recordLoginAttempt(email, ip, false);
    return fail(request, url, 'inactive');
  }

  const passwordOk = await verifyPassword(user.passwordHash, password);
  if (!passwordOk) {
    await recordLoginAttempt(email, ip, false);
    return fail(request, url, 'invalid');
  }

  // Si la contraseña está marcada como temporal y expiró, rechazar.
  if (
    user.mustChangePassword &&
    user.tempPasswordExpiresAt &&
    new Date(user.tempPasswordExpiresAt).getTime() < Date.now()
  ) {
    await recordLoginAttempt(email, ip, false);
    return fail(request, url, 'expired');
  }

  // Crear sesión + cookie.
  const userAgent = request.headers.get('user-agent') ?? undefined;
  const session = await createSession(user.id, {
    ...(ip ? { ip } : {}),
    ...(userAgent ? { userAgent } : {}),
  });
  setSessionCookie(cookies, session.id);
  await recordLoginAttempt(email, ip, true);

  // Audit.
  await db.insert(auditLog).values({
    id: ulid(),
    userId: user.id,
    action: 'auth.login',
    target: `user:${user.id}`,
    ip,
    at: new Date().toISOString(),
  });

  // Redirect destino: respetar `next` si es interno, si no dashboard por rol.
  let dest = dashboardPathFor(user.role);
  const nextParam = typeof raw.next === 'string' ? raw.next : '';
  if (nextParam.startsWith('/panel/') && !nextParam.startsWith('//')) {
    dest = nextParam;
  }
  // Primer login obliga a cambiar password.
  if (user.mustChangePassword) {
    dest = '/panel/mi-cuenta/cambiar-password/';
  }

  const wantsJson = request.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true, redirect: dest }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // dest es siempre un path absoluto interno ("/panel/..."); usar relativo
  // para que el browser lo resuelva contra el host público en lugar de que
  // Astro lo combine con el origin interno del proxy.
  return redirectTo(dest);
};
