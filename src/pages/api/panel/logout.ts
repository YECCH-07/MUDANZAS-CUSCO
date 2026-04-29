/*
 * POST /api/panel/logout — destruye la sesión actual y limpia cookie.
 * Acepta GET también para soportar un simple <a href> desde el sidebar.
 */
import type { APIRoute } from 'astro';
import { db } from '@db/client';
import { auditLog } from '@db/schema';
import { destroySession, readSessionCookie, clearSessionCookie } from '@lib/auth/session';
import { ulid } from '@lib/auth/ulid';

export const prerender = false;

async function handle(request: Request, cookies: import('astro').AstroCookies, url: URL) {
  const sid = readSessionCookie(cookies);
  if (sid) {
    await destroySession(sid);
  }
  if (cookies) clearSessionCookie(cookies);

  await db.insert(auditLog).values({
    id: ulid(),
    userId: null,
    action: 'auth.logout',
    at: new Date().toISOString(),
  });

  const wantsJson = request.headers.get('accept')?.includes('application/json');
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(null, {
    status: 303,
    headers: { Location: new URL('/panel/login/', url.origin).toString() },
  });
}

export const POST: APIRoute = ({ request, cookies, url }) => handle(request, cookies, url);
export const GET: APIRoute = ({ request, cookies, url }) => handle(request, cookies, url);
