/*
 * GET /api/panel/reports/balance.csv?from=&to=&groupBy=
 *
 * Devuelve un CSV UTF-8 con BOM (Excel Perú lo abre bien) con todos los
 * movimientos individuales (trips + entry_items) del periodo.
 */
import type { APIRoute } from 'astro';
import { between, eq } from 'drizzle-orm';
import { db } from '@db/client';
import { dailyEntries, trips, entryItems, units, users, expenseCategories } from '@db/schema';

export const prerender = false;

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export const GET: APIRoute = async (ctx) => {
  const from = ctx.url.searchParams.get('from') ?? '2026-01-01';
  const to = ctx.url.searchParams.get('to') ?? '2099-12-31';

  const entries = await db
    .select()
    .from(dailyEntries)
    .where(between(dailyEntries.entryDate, from, to))
    .all();

  const unitsMap = Object.fromEntries((await db.select().from(units).all()).map((u) => [u.id, u]));
  const usersMap = Object.fromEntries((await db.select().from(users).all()).map((u) => [u.id, u]));
  const catsMap = Object.fromEntries(
    (await db.select().from(expenseCategories).all()).map((c) => [c.id, c]),
  );

  const lines: string[] = [
    [
      'fecha',
      'unidad_placa',
      'unidad_tonelaje',
      'conductor',
      'tipo',
      'categoria',
      'descripcion',
      'origen',
      'destino',
      'monto_soles',
      'foto',
    ].join(','),
  ];

  for (const e of entries) {
    const u = unitsMap[e.unitId];
    const driver = usersMap[e.driverId];

    const ts = await db.select().from(trips).where(eq(trips.entryId, e.id)).all();
    for (const t of ts) {
      lines.push(
        [
          escapeCsv(e.entryDate),
          escapeCsv(u?.plate ?? ''),
          escapeCsv(u?.tonnage ?? ''),
          escapeCsv(driver?.fullName ?? ''),
          'ingreso (viaje)',
          escapeCsv(t.serviceKind),
          escapeCsv(
            `${t.origin} -> ${t.destination}${t.customerName ? ' (' + t.customerName + ')' : ''}`,
          ),
          escapeCsv(t.origin),
          escapeCsv(t.destination),
          (t.amountCents / 100).toFixed(2),
          '',
        ].join(','),
      );
    }

    const its = await db.select().from(entryItems).where(eq(entryItems.entryId, e.id)).all();
    for (const i of its) {
      const cat = i.categoryId ? (catsMap[i.categoryId]?.labelEs ?? '') : '';
      lines.push(
        [
          escapeCsv(e.entryDate),
          escapeCsv(u?.plate ?? ''),
          escapeCsv(u?.tonnage ?? ''),
          escapeCsv(driver?.fullName ?? ''),
          escapeCsv(i.kind === 'income' ? 'ingreso (extra)' : 'gasto'),
          escapeCsv(cat),
          escapeCsv(i.description),
          '',
          '',
          (i.amountCents / 100).toFixed(2),
          escapeCsv(i.photoKey ?? ''),
        ].join(','),
      );
    }
  }

  const body = '﻿' + lines.join('\n');
  const filename = `balance_${from}_${to}.csv`;
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
