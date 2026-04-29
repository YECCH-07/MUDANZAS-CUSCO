/*
 * POST /api/panel/route-status/  → crear reporte (caduca en 24h).
 * GET  /api/panel/route-status/  → listado público (sin auth) para widget futuro.
 *
 * Nota: el GET solo devuelve reportes vigentes (no caducados). El RBAC del
 * middleware bloquea conductor de tocar /api/panel/admin/route-status, pero
 * /api/panel/route-status/ está permitido para conductores y cotizadores.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { desc, gt, isNull, or } from 'drizzle-orm';
import { db } from '@db/client';
import { routeStatusReports } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

const Schema = z.object({
  route_slug: z.string().min(2).max(60),
  status: z.enum(['ok', 'bloqueada', 'precaucion', 'desvio']),
  note: z.string().max(300).optional().or(z.literal('')),
});

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/conductor/reportar-via/?error=Datos+invalidos' },
    });
  }
  const data = parsed.data;
  if (data.status !== 'ok' && !data.note) {
    return new Response(null, {
      status: 303,
      headers: { Location: '/panel/conductor/reportar-via/?error=Nota+obligatoria+si+no+es+OK' },
    });
  }

  const id = ulid();
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await db.insert(routeStatusReports).values({
    id,
    routeSlug: data.route_slug,
    status: data.status,
    note: data.note || 'Sin novedad',
    reportedBy: user.id,
    reportedAt: now,
    expiresAt: expires,
  });

  await logAudit(ctx, {
    action: 'route_status.report',
    target: `route:${data.route_slug}`,
    diff: { status: data.status, note: data.note },
  });

  return new Response(null, {
    status: 303,
    headers: { Location: '/panel/conductor/reportar-via/?created=true' },
  });
};

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();
  const rows = await db
    .select()
    .from(routeStatusReports)
    .where(or(isNull(routeStatusReports.expiresAt), gt(routeStatusReports.expiresAt, now)))
    .orderBy(desc(routeStatusReports.reportedAt))
    .limit(50)
    .all();
  return new Response(JSON.stringify({ ok: true, reports: rows }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
