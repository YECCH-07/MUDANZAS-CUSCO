/*
 * GET /api/panel/quotes/[id]/pdf  → genera y devuelve el PDF de la cotización.
 *
 * No persiste el PDF en B2 (las cotizaciones cambian; se genera on-demand).
 * Para recibos sí lo subimos porque son inmutables y necesitamos el QR público.
 */
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { quotes, customers, quoteItems } from '@db/schema';
import { buildQuotePdf } from '@lib/panel/pdf-quote';
import { SITE } from '@lib/site';
import { logAudit } from '@lib/panel/audit';

export const prerender = false;

export const GET: APIRoute = async (ctx) => {
  const id = ctx.params.id;
  if (!id) return new Response('missing id', { status: 400 });

  const row = await db
    .select({ q: quotes, c: customers })
    .from(quotes)
    .innerJoin(customers, eq(customers.id, quotes.customerId))
    .where(eq(quotes.id, id))
    .get();
  if (!row) return new Response('quote not found', { status: 404 });

  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id))
    .orderBy(quoteItems.orderIdx)
    .all();

  const pdfBytes = await buildQuotePdf({
    number: row.q.number,
    status: row.q.status,
    issuedAtISO: row.q.createdAt,
    expiresAtISO: row.q.expiresAt,
    customer: {
      name: row.c.name,
      phone: row.c.phone,
      docType: row.c.docType,
      docNumber: row.c.docNumber,
    },
    service: {
      serviceType: row.q.serviceType,
      origin: row.q.origin,
      destination: row.q.destination,
      tentativeDate: row.q.tentativeDate,
      volumeM3: row.q.volumeM3,
      distanceKm: row.q.distanceKm,
      crewSize: row.q.crewSize,
      floorsOrigin: row.q.floorsOrigin,
      floorsDest: row.q.floorsDest,
      hasElevator: row.q.hasElevator === true,
    },
    items:
      items.length > 0
        ? items.map((i) => ({ label: i.label, amountCents: i.amountCents }))
        : [{ label: 'Servicio', amountCents: row.q.totalCents }],
    totalCents: row.q.totalCents,
    includesIgv: row.q.includesIgv === true,
    notes: row.q.notes,
    emitter: {
      legalName: SITE.name,
      ruc: '—',
      address: `${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.country} ${SITE.address.postalCode}`,
      phone: SITE.phoneDisplay,
      email: SITE.email,
      website: SITE.url.replace(/^https?:\/\//, ''),
    },
  });

  await logAudit(ctx, { action: 'quote.pdf_download', target: `quote:${id}` });

  const filename = `cotizacion-${row.q.number}.pdf`;
  return new Response(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-cache',
    },
  });
};
