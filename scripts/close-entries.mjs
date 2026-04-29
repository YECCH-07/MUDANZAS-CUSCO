/*
 * Ejecuta manualmente el cierre de daily_entries vencidos.
 * Útil si el cron no corrió (servidor caído, reinicio, etc.).
 *
 * Uso:  npm run panel:close-entries
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

function todayLimaISO() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date());
}
function yesterdayLimaISO() {
  const today = todayLimaISO();
  const [y, m, d] = today.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  t.setUTCDate(t.getUTCDate() - 1);
  const yy = t.getUTCFullYear();
  const mm = String(t.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(t.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/panel.db').replace(/^file:/, '');
mkdirSync(dirname(resolve(rootDir, dbPath)), { recursive: true });
const sqlite = new Database(resolve(rootDir, dbPath));
sqlite.pragma('foreign_keys = ON');

const yesterday = yesterdayLimaISO();
const now = new Date().toISOString();

const toClose = sqlite
  .prepare(
    'SELECT id, entry_date, unit_id, driver_id FROM daily_entries WHERE entry_date <= ? AND closed_at IS NULL',
  )
  .all(yesterday);

console.log(
  `[close-entries] encontrados ${toClose.length} entries para cerrar (cutoff: ${yesterday})`,
);

const closeTripStmt = sqlite.prepare(
  'UPDATE trips SET ended_at = ?, updated_at = ? WHERE entry_id = ? AND ended_at IS NULL',
);
const closeEntryStmt = sqlite.prepare(
  'UPDATE daily_entries SET closed_at = ?, updated_at = ? WHERE id = ?',
);
const auditStmt = sqlite.prepare(
  "INSERT INTO audit_log (id, user_id, action, target, diff_json, ip, at) VALUES (?, NULL, 'daily_entry.manual_close', ?, ?, NULL, ?)",
);

const tx = sqlite.transaction(() => {
  for (const e of toClose) {
    closeTripStmt.run(now, now, e.id);
    closeEntryStmt.run(now, now, e.id);
    auditStmt.run(
      ulid(),
      `entry:${e.id}`,
      JSON.stringify({ entryDate: e.entry_date, unitId: e.unit_id, driverId: e.driver_id }),
      now,
    );
  }
});
tx();

sqlite.close();
console.log(`[close-entries] cerrados ${toClose.length} entries correctamente.`);
