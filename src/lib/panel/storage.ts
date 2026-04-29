/*
 * Presigned URLs para subir objetos directamente desde el navegador a
 * Backblaze B2 (S3-compatible), sin pasar por el servidor Astro.
 * Ver PANEL-INTERNO.md §3.1 y §8.
 *
 * Dos buckets (Q3=B):
 *  - B2_BUCKET_FOTOS: fotos operativas de ingresos/gastos/pre-trip/incidentes.
 *                     Retención 2 años (cold archive posterior).
 *  - B2_BUCKET_DOCS : documentos legales (SOAT, licencias, PDFs de recibos).
 *                     Versionado habilitado, retención indefinida.
 *
 * Flujo:
 *   1. Cliente pide URL → POST /api/panel/upload-url con {scope, contentType, size}
 *   2. Servidor genera objectKey, valida, firma URL PUT con expiración 5 min
 *   3. Cliente hace PUT directo al bucket con el Content-Type correcto
 *   4. Cliente envía el objectKey al guardar el ítem
 */
import { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ulid } from '@lib/auth/ulid';

export type StorageScope = 'fotos' | 'docs';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_DOC_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DOC_BYTES = 15 * 1024 * 1024; // 15 MB (PDFs de recibos pueden ser mayores)
const PUT_EXPIRES_SECONDS = 5 * 60;
const GET_EXPIRES_SECONDS = 60 * 60;

export interface StorageConfig {
  keyId: string;
  applicationKey: string;
  endpoint: string;
  bucketFotos: string;
  bucketDocs: string;
}

function readConfig(): StorageConfig | null {
  const keyId = process.env.B2_KEY_ID;
  const applicationKey = process.env.B2_APPLICATION_KEY;
  const endpoint = process.env.B2_ENDPOINT;
  const bucketFotos = process.env.B2_BUCKET_FOTOS;
  const bucketDocs = process.env.B2_BUCKET_DOCS;
  if (!keyId || !applicationKey || !endpoint || !bucketFotos || !bucketDocs) {
    return null;
  }
  return { keyId, applicationKey, endpoint, bucketFotos, bucketDocs };
}

let clientCache: { cfg: StorageConfig; client: S3Client } | null = null;

function getClient(): { cfg: StorageConfig; client: S3Client } | null {
  if (clientCache) return clientCache;
  const cfg = readConfig();
  if (!cfg) return null;

  const client = new S3Client({
    endpoint: cfg.endpoint,
    region: 'us-west-002', // B2 acepta cualquier región; us-west-002 es el default del endpoint
    credentials: {
      accessKeyId: cfg.keyId,
      secretAccessKey: cfg.applicationKey,
    },
    // B2 requiere firma v4 sin checksum SHA256 en el cuerpo (evita re-stream).
    forcePathStyle: false,
  });

  clientCache = { cfg, client };
  return clientCache;
}

export function isStorageConfigured(): boolean {
  return readConfig() !== null;
}

function bucketFor(scope: StorageScope, cfg: StorageConfig): string {
  return scope === 'docs' ? cfg.bucketDocs : cfg.bucketFotos;
}

function maxBytesFor(scope: StorageScope): number {
  return scope === 'docs' ? MAX_DOC_BYTES : MAX_PHOTO_BYTES;
}

function allowedTypesFor(scope: StorageScope): Set<string> {
  return scope === 'docs' ? ALLOWED_DOC_TYPES : ALLOWED_IMAGE_TYPES;
}

function extensionFor(contentType: string): string {
  switch (contentType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    default:
      return 'bin';
  }
}

function buildKey(scope: StorageScope, prefix: string, ext: string): string {
  const yyyy = new Date().getUTCFullYear();
  const mm = String(new Date().getUTCMonth() + 1).padStart(2, '0');
  const id = ulid().toLowerCase();
  return `${scope}/${prefix}/${yyyy}/${mm}/${id}.${ext}`;
}

export interface PresignedUploadRequest {
  scope: StorageScope;
  contentType: string;
  size: number;
  prefix?: string; // ej. 'entry-items', 'pre-trip', 'unit-docs'
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresIn: number;
  maxBytes: number;
}

export async function createPresignedUpload(
  req: PresignedUploadRequest,
): Promise<{ ok: true; data: PresignedUploadResponse } | { ok: false; error: string }> {
  const ctx = getClient();
  if (!ctx) {
    return { ok: false, error: 'storage-not-configured' };
  }
  const { cfg, client } = ctx;
  const { scope, contentType, size, prefix = 'misc' } = req;

  if (!allowedTypesFor(scope).has(contentType)) {
    return { ok: false, error: 'content-type-invalid' };
  }
  if (size <= 0 || size > maxBytesFor(scope)) {
    return { ok: false, error: 'size-invalid' };
  }
  if (!/^[a-z0-9-]{2,40}$/.test(prefix)) {
    return { ok: false, error: 'prefix-invalid' };
  }

  const objectKey = buildKey(scope, prefix, extensionFor(contentType));
  const bucket = bucketFor(scope, cfg);

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: size,
  });

  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: PUT_EXPIRES_SECONDS });

  return {
    ok: true,
    data: {
      uploadUrl,
      objectKey,
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      expiresIn: PUT_EXPIRES_SECONDS,
      maxBytes: maxBytesFor(scope),
    },
  };
}

/**
 * URL firmada de lectura (1 hora) para mostrar una foto/documento.
 * Null si storage no configurado (dev sin B2).
 */
export async function signedGetUrl(scope: StorageScope, objectKey: string): Promise<string | null> {
  const ctx = getClient();
  if (!ctx) return null;
  const { cfg, client } = ctx;
  const cmd = new GetObjectCommand({
    Bucket: bucketFor(scope, cfg),
    Key: objectKey,
  });
  return getSignedUrl(client, cmd, { expiresIn: GET_EXPIRES_SECONDS });
}
