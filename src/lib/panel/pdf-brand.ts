/*
 * Helpers de marca para PDFs (logo + colores corporativos).
 * El logo se carga una sola vez por proceso desde public/.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { rgb } from 'pdf-lib';

export const BRAND = {
  primary: rgb(0.843, 0.149, 0.22), // #D72638
  primaryDark: rgb(0.65, 0.114, 0.169), // #A61D2B
  dark: rgb(0.06, 0.06, 0.06),
  gray: rgb(0.42, 0.42, 0.42),
  lightGray: rgb(0.88, 0.88, 0.88),
};

let cachedLogo: Uint8Array | null | undefined;

/**
 * Carga el logo PNG de Expresos Ñan desde public/. Devuelve null si no existe
 * (los PDFs siguen funcionando sin logo, solo con cabecera textual).
 */
export async function loadLogoBytes(): Promise<Uint8Array | null> {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const path = resolve(process.cwd(), 'public/wp-content/uploads/2024/05/NAN-2.png');
    const buf = await readFile(path);
    cachedLogo = new Uint8Array(buf);
  } catch {
    cachedLogo = null;
  }
  return cachedLogo;
}
