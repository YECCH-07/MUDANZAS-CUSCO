/*
 * Hashing y verificación de contraseñas con Argon2id.
 * Parámetros OWASP 2023+: memoryCost 19MiB, timeCost 2, parallelism 1.
 * Ver PANEL-INTERNO.md §7.
 */
import { hash, verify } from '@node-rs/argon2';

// Argon2id = 2. Inline literal porque el enum Algorithm es `const enum` y
// `verbatimModuleSyntax` no permite importarlo como valor.
const OPTIONS = {
  algorithm: 2 as const,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 8) {
    throw new Error('Password demasiado corta (mínimo 8 caracteres)');
  }
  return hash(plain, OPTIONS);
}

export async function verifyPassword(hashStr: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashStr, plain);
  } catch {
    // hash inválido o corrupto -> tratar como fallo sin filtrar detalle
    return false;
  }
}

/**
 * Genera una contraseña temporal legible (12 caracteres, sin ambigüedades).
 * Se entrega al usuario una sola vez; debe cambiarla en el primer login.
 */
export function generateTempPassword(): string {
  // Sin I/l/1/O/0 para evitar confusiones visuales al dictarla
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) {
    out += chars[b % chars.length];
  }
  return out;
}
