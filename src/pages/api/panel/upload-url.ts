/*
 * POST /api/panel/upload-url
 * Body JSON: { scope, contentType, size, prefix? }
 * Respuesta 200:
 *   { ok: true, uploadUrl, objectKey, method, headers, expiresIn, maxBytes }
 *
 * Si B2 no está configurado (dev sin credenciales), responde 503 con
 * { ok: false, error: 'storage-not-configured' } para que la UI lo detecte
 * y muestre un mensaje claro al usuario.
 *
 * Autorización:
 *   - conductor: puede subir fotos (scope='fotos')
 *   - cotizador: puede subir documentos (scope='docs') y fotos
 *   - superadmin: ambos
 */
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createPresignedUpload } from '@lib/panel/storage';

export const prerender = false;

const Schema = z.object({
  scope: z.enum(['fotos', 'docs']),
  contentType: z.string().min(1).max(100),
  size: z
    .number()
    .int()
    .min(1)
    .max(20 * 1024 * 1024),
  prefix: z
    .string()
    .regex(/^[a-z0-9-]{2,40}$/)
    .optional(),
});

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user!;

  let raw: unknown;
  try {
    raw = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid-json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ ok: false, error: 'invalid', issues: parsed.error.issues }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { scope } = parsed.data;

  // RBAC: conductor no puede subir a docs.
  if (scope === 'docs' && user.role === 'conductor') {
    return new Response(JSON.stringify({ ok: false, error: 'forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Normalizar para cumplir exactOptionalPropertyTypes: omite prefix si undefined.
  const req = parsed.data.prefix
    ? {
        scope: parsed.data.scope,
        contentType: parsed.data.contentType,
        size: parsed.data.size,
        prefix: parsed.data.prefix,
      }
    : {
        scope: parsed.data.scope,
        contentType: parsed.data.contentType,
        size: parsed.data.size,
      };
  const result = await createPresignedUpload(req);
  if (!result.ok) {
    const status = result.error === 'storage-not-configured' ? 503 : 400;
    return new Response(JSON.stringify({ ok: false, error: result.error }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, ...result.data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
