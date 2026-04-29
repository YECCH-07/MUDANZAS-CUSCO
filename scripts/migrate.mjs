/*
 * Aplica todas las migraciones Drizzle pendientes al DB configurado.
 * Uso:
 *   npm run db:migrate
 *
 * Se ejecuta automáticamente en el arranque del servidor (integración Astro),
 * pero también se puede correr manualmente en dev.
 */
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/panel.db').replace(/^file:/, '');
mkdirSync(dirname(resolve(rootDir, dbPath)), { recursive: true });

const sqlite = new Database(resolve(rootDir, dbPath));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite);

console.log(`[migrate] aplicando migraciones a ${dbPath}`);
migrate(db, { migrationsFolder: resolve(rootDir, 'src/db/migrations') });
console.log('[migrate] OK');

sqlite.close();
