/*
 * Crea el primer superadmin del panel interno.
 * Uso:
 *   ADMIN_EMAIL=tucorreo@ejemplo.com \
 *   ADMIN_NAME="Yeison" \
 *   ADMIN_PHONE=925671052 \
 *   npm run seed:admin
 *
 * Imprime la contraseña temporal UNA SOLA VEZ en stdout. Comunícala al
 * usuario por WhatsApp. La contraseña expira en 24h y debe cambiarse en el
 * primer login.
 *
 * Si ya existe un superadmin, aborta sin modificar nada.
 */
import Database from 'better-sqlite3';
import { hash } from '@node-rs/argon2';
import { mkdirSync } from 'node:fs';
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

function encodeTime(now, len = 10) {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let out = '';
  for (let i = len - 1; i >= 0; i--) {
    const mod = now % 32;
    out = alphabet[mod] + out;
    now = (now - mod) / 32;
  }
  return out;
}
function encodeRandom(len = 16) {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += alphabet[b % 32];
  return out;
}
function ulid() {
  return encodeTime(Date.now()) + encodeRandom();
}

const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const fullName = (process.env.ADMIN_NAME ?? '').trim();
const phone = (process.env.ADMIN_PHONE ?? '').trim() || null;

if (!email || !fullName) {
  console.error('[seed:admin] ERROR: faltan variables ADMIN_EMAIL y/o ADMIN_NAME');
  console.error('Uso: ADMIN_EMAIL=... ADMIN_NAME=... ADMIN_PHONE=... npm run seed:admin');
  process.exit(1);
}

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/panel.db').replace(/^file:/, '');
mkdirSync(dirname(resolve(rootDir, dbPath)), { recursive: true });
const sqlite = new Database(resolve(rootDir, dbPath));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// 1. ¿Ya existe superadmin?
const existing = sqlite.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'superadmin'").get();

if (existing && existing.n > 0) {
  console.error('[seed:admin] ERROR: ya existe al menos un superadmin. Aborto.');
  console.error(
    'Para resetear password usa: ADMIN_EMAIL=... npm run seed:admin:reset (no implementado aún).',
  );
  sqlite.close();
  process.exit(2);
}

// 2. ¿Email duplicado?
const dupe = sqlite.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (dupe) {
  console.error(`[seed:admin] ERROR: el email ${email} ya existe con otro rol. Aborto.`);
  sqlite.close();
  process.exit(3);
}

// 3. Generar password temporal y hash Argon2id.
const tempPw = tempPassword();
const hashStr = await hash(tempPw, {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
});

// 4. Insertar.
const id = ulid();
const now = new Date().toISOString();
const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

sqlite
  .prepare(
    `INSERT INTO users (
      id, email, full_name, role, password_hash, phone,
      active, must_change_password, temp_password_expires_at,
      totp_enabled, created_at, updated_at
    ) VALUES (?, ?, ?, 'superadmin', ?, ?, 1, 1, ?, 0, ?, ?)`,
  )
  .run(id, email, fullName, hashStr, phone, expires, now, now);

// 5. Registrar en audit.
sqlite
  .prepare(
    `INSERT INTO audit_log (id, user_id, action, target, at)
     VALUES (?, NULL, 'user.seed_superadmin', ?, ?)`,
  )
  .run(ulid(), `user:${id}`, now);

sqlite.close();

// 6. Imprimir contraseña UNA SOLA VEZ.
console.log('\n=========================================================');
console.log('SUPERADMIN CREADO');
console.log('=========================================================');
console.log(`Email:       ${email}`);
console.log(`Nombre:      ${fullName}`);
console.log(`Password:    ${tempPw}`);
console.log(`Expira:      ${expires}`);
console.log('=========================================================');
console.log('IMPORTANTE:');
console.log(' - Comparte esta password UNA VEZ con el usuario (por WhatsApp).');
console.log(' - El usuario debe cambiarla en el primer login.');
console.log(' - Esta password NO se guarda en ningún log.');
console.log('=========================================================\n');
