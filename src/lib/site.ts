/*
 * Constantes globales del sitio.
 * Datos de contacto y rutas de navegación: cambiar aquí se refleja en todo el sitio.
 *
 * Los datos sensibles (API keys) viven en .env; esto es solo para datos públicos.
 */

export const SITE = {
  name: 'Expresos Ñan',
  url: 'https://cuscomudanzas.com',
  phone: '925671052',
  phoneE164: '+51925671052',
  phoneDisplay: '925 671 052',
  whatsapp: '51925671052',
  email: 'mudanzasexpresoqhapaq@gmail.com',
  address: {
    street: 'René de la Molina',
    locality: 'Cusco',
    region: 'Cusco',
    postalCode: '08004',
    country: 'PE',
  },
  openingHours: {
    weekdays: '07:00 - 20:00',
    sunday: '08:00 - 18:00',
  },
  social: {
    facebook: 'https://facebook.com/ExpresoQhapaq',
    facebookSecondary: 'https://facebook.com/MudanzaCusco1',
    instagram: 'https://instagram.com/cuscomudanzas1',
    tiktok: 'https://tiktok.com/@MudanzasCusco11',
  },
  logo: {
    primary: '/wp-content/uploads/2024/05/servicio-de-mudanzas-Flete-Carga-Logo-Expreso-Nan.png',
    icon: '/wp-content/uploads/2024/05/NAN-2.png',
  },
} as const;

/**
 * Rutas de navegación principal.
 * Cada idioma tiene su propio set porque las URLs SEO-críticas son distintas entre ES y EN
 * (ver docs/URLS-MAP.md).
 */
export const NAV = {
  es: [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/about/' },
    {
      label: 'Servicios',
      href: '/servicio-de-caraga-flete-y-mudanza-cusco/',
      children: [
        {
          label: 'Mudanzas locales',
          href: '/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/',
        },
        { label: 'Mudanzas inter-provincia', href: '/mudanza-provincia/' },
        { label: 'Mudanzas de oficina', href: '/mudanzas-de-o/' },
        { label: 'Almacenaje y custodia', href: '/almacenaje-y-custodia-cusco/' },
        { label: 'Flota de camiones', href: '/flota-de-camiones-cusco/' },
        { label: 'Embalaje', href: '/servicio-de-embalaje-cusco/' },
        { label: 'Flete y carga', href: '/servicio-de-flete-cusco/' },
      ],
    },
    {
      label: 'Cobertura',
      href: '/cobertura/',
      children: [
        { label: '— Cusco metropolitano —', href: '/cobertura/#metro' },
        { label: 'Cusco Centro', href: '/mudanzas-cusco-centro/' },
        { label: 'Wanchaq', href: '/mudanzas-wanchaq/' },
        { label: 'San Sebastián', href: '/mudanzas-san-sebastian/' },
        { label: 'San Jerónimo', href: '/mudanzas-san-jeronimo/' },
        { label: '— Valle Sagrado y alrededores —', href: '/cobertura/#valle-sagrado' },
        { label: 'Pisac, Calca, Urubamba', href: '/cobertura/#valle-1-2h' },
        { label: 'Ollantaytambo, Chinchero, Maras', href: '/cobertura/#valle-2-3h' },
        { label: 'Machupicchu, Paucartambo, Urcos', href: '/cobertura/#valle-3-4h' },
        { label: '— Inter-provincial largo —', href: '/cobertura/#interprovincial' },
        { label: 'Cusco ↔ Sicuani', href: '/mudanzas-cusco-sicuani/' },
        { label: 'Cusco ↔ Abancay', href: '/mudanzas-cusco-abancay/' },
        { label: 'Cusco ↔ Challhuahuacho', href: '/mudanzas-cusco-challhuahuacho/' },
      ],
    },
    { label: 'Blog', href: '/blog/' },
    { label: 'FAQ', href: '/preguntas-frecuentes/' },
    { label: 'Contacto', href: '/contact/' },
  ],
  en: [
    { label: 'Home', href: '/en/' },
    { label: 'About', href: '/en/about/' },
    {
      label: 'Services',
      href: '/en/services/',
      children: [
        { label: 'Local Moving', href: '/en/local-moving-cusco/' },
        { label: 'Intercity Moving', href: '/en/intercity-moving/' },
        { label: 'Office Moving', href: '/en/office-moving-cusco/' },
        { label: 'Storage & Custody', href: '/en/storage-and-custody-cusco/' },
        { label: 'Our Fleet', href: '/en/our-fleet/' },
      ],
    },
    { label: 'Coverage', href: '/en/coverage/' },
    { label: 'FAQ', href: '/en/faq/' },
    { label: 'Contact', href: '/en/contact/' },
  ],
} as const;

export type NavItem = (typeof NAV)['es'][number];
