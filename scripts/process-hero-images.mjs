/*
 * Procesa las fotografías de portada entregadas por el cliente:
 * - Convierte JPG originales a WebP (3 tamaños: 1920w, 1280w, 768w)
 * - Mantiene una versión JPG optimizada 1920w como fallback
 * - Ubica los archivos en /public/hero/ con nombres semánticos
 *
 * Uso:
 *   node scripts/process-hero-images.mjs
 *
 * Requiere Sharp ya instalado como dependencia.
 */
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'imagenes', 'FOTOGRAFIAS DE PORTADA');
const OUT = resolve(ROOT, 'public', 'hero');

// source -> slug (output file base name)
const IMAGES = [
  { source: 'FOTO-DE-PORTADA.jpg', slug: 'home-hero' },
  { source: 'QUIENES-SOMOS.jpg', slug: 'about-hero' },
  { source: 'SERVICIOS.jpg', slug: 'services-hero' },
];

const WIDTHS = [
  { suffix: '', width: 1920 }, // desktop
  { suffix: '-tablet', width: 1280 },
  { suffix: '-mobile', width: 768 },
];

async function fileSize(path) {
  try {
    const s = await stat(path);
    return s.size;
  } catch {
    return 0;
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });

  for (const img of IMAGES) {
    const src = resolve(SRC, img.source);
    const srcSize = await fileSize(src);
    if (srcSize === 0) {
      console.error(`✗ Fuente no encontrada: ${src}`);
      continue;
    }

    console.log(`\n→ ${img.source}  (${(srcSize / 1024).toFixed(0)} KB)`);

    for (const { suffix, width } of WIDTHS) {
      // WebP (principal)
      const webp = resolve(OUT, `${img.slug}${suffix}.webp`);
      await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(webp);
      const webpSize = await fileSize(webp);
      console.log(`  ✓ ${img.slug}${suffix}.webp  ${width}w  ${(webpSize / 1024).toFixed(0)} KB`);
    }

    // JPG fallback sólo en tamaño desktop (WebP cubre todo navegador moderno)
    const jpg = resolve(OUT, `${img.slug}.jpg`);
    await sharp(src)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(jpg);
    const jpgSize = await fileSize(jpg);
    console.log(`  ✓ ${img.slug}.jpg  1920w  ${(jpgSize / 1024).toFixed(0)} KB (fallback)`);
  }

  console.log(`\n✓ Listo. Archivos en ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
