/*
 * Inserta el catálogo inicial de categorías de gasto.
 * Idempotente: si ya existen, no duplica (upsert por slug).
 *
 * Uso:  npm run seed:categories
 */
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

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
const ulid = () => encodeTime(Date.now()) + encodeRandom();

// umbral en céntimos: null = foto nunca obligatoria por categoría
const CATEGORIES = [
  { slug: 'combustible', label: 'Combustible', thresholdCents: 5000 },
  { slug: 'lavado', label: 'Lavado', thresholdCents: null },
  { slug: 'peaje', label: 'Peaje', thresholdCents: 5000 },
  { slug: 'alimentacion', label: 'Alimentación', thresholdCents: null },
  { slug: 'reparacion', label: 'Reparación', thresholdCents: 3000 },
  { slug: 'llantas', label: 'Llantas', thresholdCents: 3000 },
  { slug: 'frenos', label: 'Frenos', thresholdCents: 3000 },
  { slug: 'hospedaje', label: 'Hospedaje en ruta', thresholdCents: 5000 },
  { slug: 'estacionamiento', label: 'Estacionamiento', thresholdCents: null },
  { slug: 'otros', label: 'Otros', thresholdCents: 5000 },
];

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/panel.db').replace(/^file:/, '');
mkdirSync(dirname(resolve(rootDir, dbPath)), { recursive: true });
const sqlite = new Database(resolve(rootDir, dbPath));
sqlite.pragma('foreign_keys = ON');

const findStmt = sqlite.prepare('SELECT id FROM expense_categories WHERE slug = ?');
const insertStmt = sqlite.prepare(
  `INSERT INTO expense_categories (id, slug, label_es, requires_photo_above_cents, active)
   VALUES (?, ?, ?, ?, 1)`,
);

let created = 0;
let skipped = 0;
for (const cat of CATEGORIES) {
  const existing = findStmt.get(cat.slug);
  if (existing) {
    skipped++;
    continue;
  }
  insertStmt.run(ulid(), cat.slug, cat.label, cat.thresholdCents);
  created++;
}

sqlite.close();

console.log(`[seed:categories] creadas ${created} · existentes ${skipped}`);
