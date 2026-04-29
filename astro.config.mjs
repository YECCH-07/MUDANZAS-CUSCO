// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';

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
  // Adapter Node standalone para las rutas /panel/** y /api/panel/** que
  // corren en SSR. El resto del sitio sigue siendo estático: cada página
  // prerenderizada es la default en Astro; las páginas SSR del panel se
  // marcan explícitamente con `export const prerender = false`.
  adapter: node({ mode: 'standalone' }),
  security: {
    // Desactivamos el check global de Astro (que valida contra el `site`
    // hardcodeado cuscomudanzas.com y bloquea dev/preview local) porque
    // nuestro middleware en src/middleware.ts hace un origin check dedicado
    // para las rutas /panel/** contra SITE_URL de la env.
    checkOrigin: false,
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
      // Excluimos la styleguide interna y cualquier ruta de error del sitemap.
      filter: (page) =>
        !page.includes('/styleguide') && !page.includes('/404') && !page.includes('/500'),
      // Priority + changefreq por tipo de página. lastmod lo rellena Astro
      // automáticamente usando la fecha de build.
      serialize(item) {
        const url = item.url;
        // Home (es y en)
        if (url === 'https://cuscomudanzas.com/' || url === 'https://cuscomudanzas.com/en/') {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (url.includes('/blog/')) {
          // Blog posts individuales: actualización mensual
          item.priority = /\/blog\/[^/]+\/$/.test(url.replace('https://cuscomudanzas.com', ''))
            ? 0.7
            : 0.6;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (url.includes('/mudanzas-')) {
          // Landings de servicios y rutas (altas prioridad SEO)
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else if (url.includes('/en/')) {
          item.priority = 0.7;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        } else {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        return item;
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
