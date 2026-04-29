/*
 * POST /api/panel/receipts/issue-from-job/[id]
 *
 * Emite un recibo a partir de un job completed.
 *   1. Genera uuid + número secuencial.
 *   2. Construye PDF (pdf-lib) con QR apuntando a /verificar/[uuid].
 *   3. Si B2 está configurado, sube al bucket docs; si no, guarda pdfKey NULL
 *      (el verificador seguirá funcionando sin la descarga del PDF).
 *   4. Inserta fila receipts.
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@db/client';
import { receipts, jobs, quotes, customers, units, users, quoteItems } from '@db/schema';
import { ulid } from '@lib/auth/ulid';
import { nextReceiptNumber } from '@lib/panel/numbering';
import { logAudit } from '@lib/panel/audit';
import { buildReceiptPdf } from '@lib/panel/pdf-receipt';
import { createPresignedUpload, isStorageConfigured } from '@lib/panel/storage';
import { SITE } from '@lib/site';

export const prerender = false;

const Schema = z.object({
  payment_method: z.enum(['efectivo', 'transferencia', 'yape', 'plin', 'otro']),
  requires_sunat: z.string().optional(),
  doc_kind: z.enum(['recibo', 'boleta_ref', 'factura_ref']).default('recibo'),
});

async function parseBody(request: Request) {
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) return (await request.json()) as Record<string, unknown>;
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}
function redirect(loc: string) {
  return new Response(null, { status: 303, headers: { Location: loc } });
}

function randomUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return ulid().toLowerCase();
}

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;
  const jobId = ctx.params.id;
  if (!jobId) return new Response('missing id', { status: 400 });

  const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) return new Response('job not found', { status: 404 });
  if (job.status !== 'completed') {
    return redirect(`/panel/cotizador/trabajos/${jobId}/?error=not-completed`);
  }

  const existing = await db.select().from(receipts).where(eq(receipts.jobId, jobId)).get();
  if (existing) {
    return redirect(`/panel/cotizador/recibos/${existing.id}/`);
  }

  const raw = await parseBody(ctx.request);
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return redirect(`/panel/cotizador/trabajos/${jobId}/?error=invalid`);
  }
  const data = parsed.data;

  const quote = await db.select().from(quotes).where(eq(quotes.id, job.quoteId)).get();
  if (!quote) return new Response('quote missing', { status: 500 });

  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.id, quote.customerId))
    .get();
  if (!customer) return new Response('customer missing', { status: 500 });

  const unit = job.assignedUnitId
    ? await db.select().from(units).where(eq(units.id, job.assignedUnitId)).get()
    : null;
  const driver = job.assignedDriverId
    ? await db.select().from(users).where(eq(users.id, job.assignedDriverId)).get()
    : null;

  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id))
    .orderBy(quoteItems.orderIdx)
    .all();

  const receiptId = ulid();
  const receiptUuid = randomUuid();
  const receiptNumber = nextReceiptNumber();
  const issuedAt = new Date().toISOString();

  // Construir PDF.
  const verifyUrl = `${SITE.url}/verificar/${receiptUuid}/`;
  const pdfBytes = await buildReceiptPdf({
    number: receiptNumber,
    uuid: receiptUuid,
    issuedAtISO: issuedAt,
    customer: {
      name: customer.name,
      phone: customer.phone,
      docType: customer.docType,
      docNumber: customer.docNumber,
    },
    service: {
      serviceType: quote.serviceType,
      origin: quote.origin,
      destination: quote.destination,
      scheduledDate: job.scheduledDate,
      unitPlate: unit?.plate ?? null,
      driverName: driver?.fullName ?? null,
      volumeM3: quote.volumeM3,
      distanceKm: quote.distanceKm,
      crewSize: quote.crewSize,
      floorsOrigin: quote.floorsOrigin,
      floorsDest: quote.floorsDest,
      hasElevator: quote.hasElevator,
    },
    items:
      items.length > 0
        ? items.map((i) => ({ label: i.label, amountCents: i.amountCents }))
        : [{ label: 'Servicio', amountCents: quote.totalCents }],
    totalCents: quote.totalCents,
    paymentMethod: data.payment_method,
    includesIgv: quote.includesIgv === true,
    verifyUrl,
    emitter: {
      legalName: SITE.name,
      ruc: '—', // ajustar cuando esté configurado en admin
      address: `${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.country} ${SITE.address.postalCode}`,
      phone: SITE.phoneDisplay,
      email: SITE.email,
    },
  });

  // Intentar subir a B2 si está configurado.
  let pdfKey: string | null = null;
  if (isStorageConfigured()) {
    const pre = await createPresignedUpload({
      scope: 'docs',
      contentType: 'application/pdf',
      size: pdfBytes.byteLength,
      prefix: 'receipts',
    });
    if (pre.ok) {
      const putRes = await fetch(pre.data.uploadUrl, {
        method: 'PUT',
        headers: pre.data.headers,
        body: new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
      });
      if (putRes.ok) pdfKey = pre.data.objectKey;
    }
  }

  await db.insert(receipts).values({
    id: receiptId,
    uuid: receiptUuid,
    number: receiptNumber,
    quoteId: quote.id,
    jobId: job.id,
    customerId: customer.id,
    totalCents: quote.totalCents,
    paymentMethod: data.payment_method,
    docKind: data.doc_kind,
    requiresSunatInvoice: data.requires_sunat === '1',
    includesIgv: quote.includesIgv === true, // hereda de la cotización
    pdfKey,
    issuedBy: user.id,
    issuedAt,
    voidedAt: null,
    voidReason: null,
  });

  await logAudit(ctx, {
    action: 'receipt.issue',
    target: `receipt:${receiptId}`,
    diff: { number: receiptNumber, jobId: job.id, hasPdfStorage: !!pdfKey },
  });

  return redirect(`/panel/cotizador/recibos/${receiptId}/`);
};
