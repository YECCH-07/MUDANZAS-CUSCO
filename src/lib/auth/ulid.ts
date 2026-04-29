/*
 * Generación de IDs ULID (lexicográficamente ordenables, 26 chars Crockford
 * base32). Implementación propia mínima para evitar dependencia externa.
 * Ver spec: https://github.com/ulid/spec
 *
 * Si en algún momento necesitamos ULIDs monotónicos dentro del mismo ms,
 * migrar a la lib `ulid` de npm.
 */
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford

function encodeTime(now: number, len = 10): string {
  let out = '';
  for (let i = len - 1; i >= 0; i--) {
    const mod = now % 32;
    out = ENCODING[mod] + out;
    now = (now - mod) / 32;
  }
  return out;
}

function encodeRandom(len = 16): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) {
    out += ENCODING[b % 32];
  }
  return out;
}

export function ulid(): string {
  return encodeTime(Date.now()) + encodeRandom();
}
