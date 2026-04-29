/*
 * Cliente singleton de la base de datos SQLite del panel interno.
 * En dev: `./data/panel.db`. En producción: `/var/lib/cuscomudanzas/panel.db`.
 *
 * Pragmas activos:
 *  - journal_mode=WAL para concurrencia real de lecturas + escrituras.
 *  - foreign_keys=ON porque SQLite las ignora por defecto.
 *  - synchronous=NORMAL (buen balance durabilidad/rendimiento con WAL).
 *  - busy_timeout=5000 (espera hasta 5s antes de SQLITE_BUSY).
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema';

function resolveDatabasePath(): string {
  const raw = process.env.DATABASE_URL ?? 'file:./data/panel.db';
  return raw.replace(/^file:/, '');
}

const dbPath = resolveDatabasePath();
// Asegura que el directorio exista antes de abrir la DB (evita errores en dev
// la primera vez que se arranca).
try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch {
  // ignorar: si el FS es read-only en algún entorno raro, better-sqlite3 dará
  // el error real al intentar abrir.
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, { schema });
export { schema };
export type DB = typeof db;
