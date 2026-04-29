/*
 * Helper para escribir entradas de audit_log de forma consistente.
 * Ver PANEL-INTERNO.md §4.5 y PANEL-01 §1.16.
 */
import type { APIContext } from 'astro';
import { db } from '@db/client';
import { auditLog } from '@db/schema';
import { ulid } from '@lib/auth/ulid';

export interface AuditInput {
  action: string;
  target?: string;
  diff?: unknown;
}

export async function logAudit(ctx: APIContext, input: AuditInput): Promise<void> {
  const userId = ctx.locals.user?.id ?? null;
  const ip = ctx.clientAddress ?? null;

  await db.insert(auditLog).values({
    id: ulid(),
    userId,
    action: input.action,
    target: input.target ?? null,
    diffJson: input.diff !== undefined ? JSON.stringify(input.diff) : null,
    ip,
    at: new Date().toISOString(),
  });
}
