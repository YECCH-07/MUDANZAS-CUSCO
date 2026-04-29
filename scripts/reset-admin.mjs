/*
 * Resetea la contraseña de un superadmin existente.
 * Genera password temporal de 12 chars, fuerza must_change_password,
 * invalida todas las sesiones activas y deja huella en audit.
 *
 * Uso:
 *   ADMIN_EMAIL=yeison@cuscomudanzas.com node scripts/reset-admin.mjs
 */
import Database from 'better-sqlite3';
import { hash } from '@node-rs/argon2';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const ENCODING = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
function tempPassword() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += ENCODING[b % ENCODING.length];
  return out;
}
function ulid() {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let now = Date.now();
  let time = '';
  for (let i = 9; i >= 0; i--) {
    const mod = now % 32;
    time = alphabet[mod] + time;
    now = (now - mod) / 32;
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let rand = '';
  for (const b of bytes) rand += alphabet[b % 32];
  return time + rand;
}

const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
if (!email) {
  console.error('[reset-admin] falta ADMIN_EMAIL');
  process.exit(1);
}

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/panel.db').replace(/^file:/, '');
const sqlite = new Database(resolve(rootDir, dbPath));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const user = sqlite.prepare('SELECT id, role FROM users WHERE email = ?').get(email);
if (!user) {
  console.error(`[reset-admin] no existe usuario ${email}`);
  sqlite.close();
  process.exit(2);
}
if (user.role !== 'superadmin') {
  console.error(`[reset-admin] el usuario ${email} no es superadmin (rol: ${user.role})`);
  sqlite.close();
  process.exit(3);
}

const tempPw = tempPassword();
const hashStr = await hash(tempPw, {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});
const now = new Date().toISOString();
const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

sqlite
  .prepare(
    `UPDATE users SET
      password_hash = ?,
      must_change_password = 1,
      temp_password_expires_at = ?,
      updated_at = ?
     WHERE id = ?`,
  )
  .run(hashStr, expires, now, user.id);

const sessionsKilled = sqlite.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);

sqlite
  .prepare(
    `INSERT INTO audit_log (id, user_id, action, target, at)
     VALUES (?, NULL, 'user.reset_password_cli', ?, ?)`,
  )
  .run(ulid(), `user:${user.id}`, now);

sqlite.close();

console.log('\n=========================================================');
console.log('PASSWORD RESET');
console.log('=========================================================');
console.log(`Email:       ${email}`);
console.log(`Password:    ${tempPw}`);
console.log(`Expira:      ${expires}`);
console.log(`Sesiones revocadas: ${sessionsKilled.changes}`);
console.log('=========================================================');
console.log('Cámbiala en el primer login. No queda en logs.');
console.log('=========================================================\n');
