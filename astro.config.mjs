// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
//
// Reglas inviolables de este proyecto:
//  - `trailingSlash: 'always'` y `build.format: 'directory'` para preservar
//    las URLs originales del WordPress actual (Regla #2 de SEO-PRESERVATION.md).
//  - i18n: español por defecto sin prefijo, inglés bajo /en/ (Regla #8).
//  - Sitemap separado por idioma con hreflang.
export default defineConfig({
  site: 'https://cuscomudanzas.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-PE',
          en: 'en-US',
        },
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
