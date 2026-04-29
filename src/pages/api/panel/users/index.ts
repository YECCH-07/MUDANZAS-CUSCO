/*
 * POST /api/panel/users/
 * Crea un nuevo usuario con password temporal (24h, must_change_password=1).
 * Solo superadmin (validado por middleware/RBAC).
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { users } from '@db/schema';
import { hashPassword, generateTempPassword } from '@lib/auth/password';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';
import { sendMail, TEMPLATES } from '@lib/panel/email';

export const prerender = false;

const Schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().email().toLowerCase().trim(),
  role: z.enum(['superadmin', 'cotizador', 'conductor']),
  phone: z.string().trim().optional().or(z.literal('')),
});

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async (ctx) => {
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect('/panel/admin/usuarios/nuevo/?error=invalid');
  }
  const data = parsed.data;

  // Email duplicado?
  const dupe = await db.select().from(users).where(eq(users.email, data.email)).get();
  if (dupe) {
    return redirect('/panel/admin/usuarios/nuevo/?error=duplicate');
  }

  const tempPw = generateTempPassword();
  const hashStr = await hashPassword(tempPw);
  const id = ulid();
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await db.insert(users).values({
    id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    passwordHash: hashStr,
    phone: data.phone ? data.phone : null,
    active: true,
    mustChangePassword: true,
    tempPasswordExpiresAt: expires,
    totpEnabled: false,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit(ctx, {
    action: 'user.create',
    target: `user:${id}`,
    diff: { email: data.email, role: data.role },
  });

  // Email de bienvenida (no rompe el flujo si SMTP no está configurado).
  const tpl = TEMPLATES.welcome({
    name: data.full_name,
    email: data.email,
    tempPassword: tempPw,
    loginUrl: `${ctx.url.origin}/panel/login/`,
  });
  void sendMail({ to: data.email, subject: tpl.subject, html: tpl.html });

  const wantsJson = ctx.request.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true, id, email: data.email, tempPassword: tempPw }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Pasamos la password UNA vez por la URL. Se muestra en el listado con
  // advertencia clara de que desaparece al recargar.
  const url = new URL('/panel/admin/usuarios/', ctx.url.origin);
  url.searchParams.set('created', data.email);
  url.searchParams.set('pw', tempPw);
  return redirect(url.toString());
};
