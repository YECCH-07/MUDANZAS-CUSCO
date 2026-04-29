/*
 * Sistema de sesiones basado en cookie + tabla `sessions` en la DB.
 *
 * Diseño:
 *  - Cookie HttpOnly + Secure + SameSite=Strict con el ID de sesión.
 *  - Sesiones expiran a los 30 días. Rotación automática cada 7 días
 *    para reducir ventana de reuso de tokens robados.
 *  - Al validar: si la sesión caducó, se destruye y se trata como no-auth.
 *
 * API pública:
 *  - createSession(userId, req) -> cookie string + session row
 *  - validateSession(sessionId) -> { user, session } | null
 *  - destroySession(sessionId)
 *  - setSessionCookie(cookies, sessionId) / clearSessionCookie(cookies)
 *  - getSession(astro) -> helper para Astro.locals
 *
 * Ver PANEL-INTERNO.md §7 y reemplazo a Lucia.
 */
import { eq, lt } from 'drizzle-orm';
import { db } from '@db/client';
import { sessions, users, type Session, type User } from '@db/schema';
import { ulid } from './ulid';
import type { AstroCookies } from 'astro';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'cm_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const SESSION_ROTATE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // rotar si < 7d quedan

export interface SessionContext {
  user: Omit<User, 'passwordHash' | 'totpSecret'>;
  session: Session;
}

export async function createSession(
  userId: string,
  { ip, userAgent }: { ip?: string; userAgent?: string } = {},
): Promise<Session> {
  const now = Date.now();
  const id = ulid();
  const row = {
    id,
    userId,
    expiresAt: now + SESSION_DURATION_MS,
    ip: ip ?? null,
    userAgent: userAgent ? userAgent.slice(0, 255) : null,
  };
  await db.insert(sessions).values(row);
  const created = await db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!created) throw new Error('session insert failed');
  return created;
}

export async function validateSession(sessionId: string): Promise<SessionContext | null> {
  const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt <= now) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  // Rotación: si quedan menos de 7 días, extendemos la expiración.
  if (session.expiresAt - now < SESSION_ROTATE_THRESHOLD_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: now + SESSION_DURATION_MS })
      .where(eq(sessions.id, sessionId));
    session.expiresAt = now + SESSION_DURATION_MS;
  }

  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user || !user.active) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  // Nunca exponer passwordHash / totpSecret fuera del módulo de auth.
  const { passwordHash: _ph, totpSecret: _ts, ...safeUser } = user;
  void _ph;
  void _ts;

  return { user: safeUser, session };
}

export async function destroySession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function destroyAllUserSessions(
  userId: string,
  exceptSessionId?: string,
): Promise<void> {
  const rows = await db.select().from(sessions).where(eq(sessions.userId, userId));
  for (const r of rows) {
    if (exceptSessionId && r.id === exceptSessionId) continue;
    await db.delete(sessions).where(eq(sessions.id, r.id));
  }
}

export async function listUserSessions(userId: string): Promise<Session[]> {
  return db.select().from(sessions).where(eq(sessions.userId, userId)).all();
}

/**
 * Cron de limpieza: borra sesiones expiradas (podar tabla).
 * Se llama desde src/lib/panel/cron.ts diariamente.
 */
export async function pruneExpiredSessions(): Promise<number> {
  const result = await db.delete(sessions).where(lt(sessions.expiresAt, Date.now())).run();
  return result.changes;
}

export function setSessionCookie(cookies: AstroCookies, sessionId: string): void {
  cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE === 'true',
    sameSite: 'strict',
    path: '/',
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE === 'true',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function readSessionCookie(cookies: AstroCookies): string | null {
  return cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export { SESSION_COOKIE_NAME };
