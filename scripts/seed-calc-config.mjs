/*
 * Inserta la configuración inicial de la calculadora si no existe.
 * Uso:  npm run seed:calc
 */
import Database from 'better-sqlite3';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const DEFAULT_RULES = {
  flete: { baseCents: 10000, perKmCents: 300, perM3Cents: 1500, minCents: 15000 },
  mudanza_personal: {
    baseCents: 20000,
    perKmCents: 500,
    perM3Cents: 3000,
    perCrewCents: 8000,
    perFloorWithoutElevatorCents: 3000,
    minCents: 30000,
  },
  mudanza_embalaje: {
    baseCents: 30000,
    perKmCents: 500,
    perM3Cents: 4500,
    perCrewCents: 8000,
    perFloorWithoutElevatorCents: 3000,
    minCents: 45000,
  },
  embalaje_solo: { baseCents: 15000, perKmCents: 0, perM3Cents: 4000, minCents: 20000 },
  armado_desarmado: { baseCents: 12000, perKmCents: 0, minCents: 15000 },
  almacenaje: { baseCents: 10000, perKmCents: 0, perM3Cents: 2500, minCents: 10000 },
  solo_vehiculo_personal: {
    baseCents: 15000,
    perKmCents: 400,
    perCrewCents: 7000,
    minCents: 20000,
  },
  otro: { baseCents: 10000, perKmCents: 300, minCents: 10000 },
  surcharges: { weekendPct: 10, holidayPct: 15, overnightRouteFlatCents: 20000 },
};

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/panel.db').replace(/^file:/, '');
const sqlite = new Database(resolve(rootDir, dbPath));
sqlite.pragma('foreign_keys = ON');

const existing = sqlite.prepare("SELECT id FROM calc_config WHERE id='current'").get();
if (existing) {
  console.log('[seed:calc] ya existe, no modifico. Usa panel para editar reglas.');
  sqlite.close();
  process.exit(0);
}

sqlite
  .prepare(
    "INSERT INTO calc_config (id, rules_json, updated_at) VALUES ('current', ?, datetime('now'))",
  )
  .run(JSON.stringify(DEFAULT_RULES));
console.log('[seed:calc] reglas por defecto insertadas.');
sqlite.close();
