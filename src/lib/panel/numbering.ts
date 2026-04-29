/*
 * Numeración secuencial atómica para cotizaciones (COT-YYYY-NNNN) y
 * recibos (REC-YYYY-NNNN). Usa better-sqlite3 en transacción síncrona.
 *
 * El contador se crea lazy para (año, tipo) la primera vez.
 */
import { and, eq } from 'drizzle-orm';
import { db } from '@db/client';
import { counters } from '@db/schema';

type Kind = 'quote' | 'receipt';

function prefix(kind: Kind): string {
  return kind === 'quote' ? 'COT' : 'REC';
}

function nextFor(kind: Kind): string {
  const year = new Date().getUTCFullYear();
  const existing = db
    .select()
    .from(counters)
    .where(and(eq(counters.year, year), eq(counters.kind, kind)))
    .get();

  let next: number;
  if (!existing) {
    db.insert(counters).values({ year, kind, value: 1 }).run();
    next = 1;
  } else {
    next = existing.value + 1;
    db.update(counters)
      .set({ value: next })
      .where(and(eq(counters.year, year), eq(counters.kind, kind)))
      .run();
  }

  return `${prefix(kind)}-${year}-${String(next).padStart(4, '0')}`;
}

export function nextQuoteNumber(): string {
  return nextFor('quote');
}

export function nextReceiptNumber(): string {
  return nextFor('receipt');
}
