/*
 * Genera los iconos PWA del panel a partir del logo Ñan-2.
 * Output: public/panel/icon-192.png, icon-512.png, icon-maskable-512.png.
 *
 * Uso:  npm run panel:icons
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const SRC = resolve(rootDir, 'public/wp-content/uploads/2024/05/NAN-2.png');
const OUT_DIR = resolve(rootDir, 'public/panel');
const BG = '#E40414'; // primary rojo bandera de Expresos Ñan

if (!existsSync(SRC)) {
  console.error('[icons] logo fuente no encontrado en', SRC);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

/**
 * Genera un icono cuadrado con el logo centrado sobre fondo sólido.
 * Si `maskable=true`, reserva un safe-zone del 80% central.
 */
async function makeIcon(size, outName, maskable = false) {
  const inner = Math.floor(size * (maskable ? 0.72 : 0.9));
  const logoBuffer = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: BG })
    .png()
    .toBuffer();

  const out = resolve(OUT_DIR, outName);
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log('[icons]', outName, '→', size, 'x', size);
}

await makeIcon(192, 'icon-192.png');
await makeIcon(512, 'icon-512.png');
await makeIcon(512, 'icon-maskable-512.png', true);

console.log('[icons] OK');
