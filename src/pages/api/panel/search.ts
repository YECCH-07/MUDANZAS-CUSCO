/*
 * GET /api/panel/search?q=...
 * Búsqueda global agrupada por tipo. Devuelve hasta 5 hits por grupo.
 *
 * RBAC: el conductor solo ve resultados de su propio scope (sus daily_entries),
 * superadmin y cotizador ven todo.
 */
import type { APIRoute } from 'astro';
import { like, or, eq, and } from 'drizzle-orm';
import { db } from '@db/client';
import { users, units, customers, quotes, receipts, jobs, dailyEntries } from '@db/schema';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const q = (ctx.url.searchParams.get('q') ?? '').trim();
  if (q.length < 2) {
    return new Response(JSON.stringify({ ok: true, results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const wild = `%${q}%`;
  const results: Array<{ kind: string; label: string; sub?: string; href: string }> = [];

  // Customers (cotizador + admin)
  if (user.role !== 'conductor') {
    const cs = await db
      .select({ id: customers.id, name: customers.name, phone: customers.phone })
      .from(customers)
      .where(
        or(
          like(customers.name, wild),
          like(customers.phone, wild),
          like(customers.docNumber, wild),
        ),
      )
      .limit(5)
      .all();
    for (const c of cs) {
      results.push({
        kind: 'cliente',
        label: c.name,
        sub: c.phone ?? '',
        href: `/panel/cotizador/clientes/${c.id}/`,
      });
    }

    const qs = await db
      .select({
        id: quotes.id,
        number: quotes.number,
        origin: quotes.origin,
        destination: quotes.destination,
      })
      .from(quotes)
      .where(
        or(like(quotes.number, wild), like(quotes.origin, wild), like(quotes.destination, wild)),
      )
      .limit(5)
      .all();
    for (const x of qs) {
      results.push({
        kind: 'cotización',
        label: x.number,
        sub: `${x.origin ?? '—'} → ${x.destination ?? '—'}`,
        href: `/panel/cotizador/${x.id}/`,
      });
    }

    const rs = await db
      .select({ id: receipts.id, number: receipts.number })
      .from(receipts)
      .where(like(receipts.number, wild))
      .limit(5)
      .all();
    for (const r of rs) {
      results.push({ kind: 'recibo', label: r.number, href: `/panel/cotizador/recibos/${r.id}/` });
    }

    const js = await db
      .select({ id: jobs.id, quoteId: jobs.quoteId, status: jobs.status })
      .from(jobs)
      .innerJoin(quotes, eq(quotes.id, jobs.quoteId))
      .where(
        or(like(quotes.number, wild), like(quotes.origin, wild), like(quotes.destination, wild)),
      )
      .limit(5)
      .all();
    for (const j of js) {
      results.push({
        kind: 'trabajo',
        label: j.id.slice(0, 8),
        sub: j.status,
        href: `/panel/cotizador/trabajos/${j.id}/`,
      });
    }
  }

  // Admin-only: usuarios + unidades
  if (user.role === 'superadmin') {
    const us = await db
      .select({ id: users.id, fullName: users.fullName, email: users.email, role: users.role })
      .from(users)
      .where(or(like(users.fullName, wild), like(users.email, wild)))
      .limit(5)
      .all();
    for (const u of us) {
      results.push({
        kind: 'usuario',
        label: u.fullName,
        sub: `${u.email} · ${u.role}`,
        href: `/panel/admin/usuarios/${u.id}/documentos/`,
      });
    }

    const un = await db
      .select({ id: units.id, plate: units.plate, alias: units.alias })
      .from(units)
      .where(or(like(units.plate, wild), like(units.alias, wild)))
      .limit(5)
      .all();
    for (const u of un) {
      results.push({
        kind: 'unidad',
        label: u.plate,
        sub: u.alias ?? '',
        href: `/panel/admin/unidades/${u.id}/`,
      });
    }
  }

  // Conductor: solo sus entries del día
  if (user.role === 'conductor') {
    const es = await db
      .select({
        id: dailyEntries.id,
        entryDate: dailyEntries.entryDate,
        unitId: dailyEntries.unitId,
      })
      .from(dailyEntries)
      .where(and(eq(dailyEntries.driverId, user.id), like(dailyEntries.entryDate, wild)))
      .limit(5)
      .all();
    for (const e of es) {
      results.push({
        kind: 'día',
        label: e.entryDate,
        href: `/panel/conductor/hoy/?unit=${e.unitId}`,
      });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
