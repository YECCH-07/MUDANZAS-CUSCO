/*
 * Rate limiting de intentos de login.
 * Regla: máximo 5 intentos fallidos por (email, IP) en ventana de 15 min.
 * Persistido en DB (tabla login_attempts) para sobrevivir a reinicios.
 *
 * Ver PANEL-INTERNO.md §7.
 */
import { and, count, eq, gt, lt } from 'drizzle-orm';
import { db } from '@db/client';
import { loginAttempts } from '@db/schema';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_FAILED = 5;

export async function isLoginBlocked(email: string, ip: string | null): Promise<boolean> {
  const since = Date.now() - WINDOW_MS;
  const result = await db
    .select({ n: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email),
        eq(loginAttempts.success, false),
        gt(loginAttempts.at, since),
      ),
    )
    .get();

  const failed = result?.n ?? 0;
  if (failed >= MAX_FAILED) return true;

  // Tambien bloqueamos si la misma IP acumula >= 10 fallos en la ventana
  // (sin importar el email). Defensa contra credential stuffing.
  if (ip) {
    const byIp = await db
      .select({ n: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.ip, ip),
          eq(loginAttempts.success, false),
          gt(loginAttempts.at, since),
        ),
      )
      .get();
    if ((byIp?.n ?? 0) >= MAX_FAILED * 2) return true;
  }

  return false;
}

export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  success: boolean,
): Promise<void> {
  await db.insert(loginAttempts).values({
    email,
    ip: ip ?? null,
    at: Date.now(),
    success,
  });
}

/**
 * Cron diario: purgar intentos > 24 h (ya no aportan al throttling).
 */
export async function pruneOldLoginAttempts(): Promise<number> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const result = await db.delete(loginAttempts).where(lt(loginAttempts.at, cutoff)).run();
  return result.changes;
}
