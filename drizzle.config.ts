import type { Config } from 'drizzle-kit';

/*
 * Config de drizzle-kit para generar migraciones SQL a partir del schema TS.
 * Comandos:
 *   npx drizzle-kit generate   -> genera migración en src/db/migrations/
 *   npx drizzle-kit push       -> aplica directo al DB (solo dev)
 */
export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./data/panel.db',
  },
  casing: 'snake_case',
  strict: true,
  verbose: true,
} satisfies Config;
