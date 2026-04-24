import type { Lang } from '@/i18n/config';

/**
 * Mapa bidireccional de URLs equivalentes ES <-> EN.
 *
 * Regla SEO: las URLs ES no se tocan (preservadas del WP actual, ver docs/SEO-PRESERVATION.md
 * Regla #1); las EN usan slugs en inglés bajo prefijo /en/.
 *
 * Usado para:
 *  - <link rel="alternate" hreflang="..."> en BaseLayout
 *  - <LanguageSwitcher> (mantener el usuario en la misma página al cambiar idioma)
 *
 * Cuando se agregue una nueva página bilingüe, agregar la entrada aquí.
 */
export const ES_TO_EN: Record<string, string> = {
  '/': '/en/',
  '/about/': '/en/about/',
  '/contact/': '/en/contact/',
  '/preguntas-frecuentes/': '/en/faq/',
  '/projects/': '/en/gallery/',
  '/cobertura/': '/en/coverage/',
  '/servicio-de-caraga-flete-y-mudanza-cusco/': '/en/services/',
  '/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/':
    '/en/local-moving-cusco/',
  '/mudanza-provincia/': '/en/intercity-moving/',
  '/mudanzas-de-o/': '/en/office-moving-cusco/',
  '/almacenaje-y-custodia-cusco/': '/en/storage-and-custody-cusco/',
  '/flota-de-camiones-cusco/': '/en/our-fleet/',
};

export function getAlternateUrl(path: string, targetLang: Lang): string | null {
  if (targetLang === 'en') {
    return ES_TO_EN[path] ?? null;
  }
  const reverse = Object.entries(ES_TO_EN).find(([, en]) => en === path);
  return reverse ? reverse[0] : null;
}
