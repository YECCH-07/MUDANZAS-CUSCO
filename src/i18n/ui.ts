import { defaultLang, type Lang } from './config';

/*
 * Diccionario de traducciones del sitio.
 * Mantener claves ordenadas alfabéticamente dentro de cada namespace.
 * Se expande en SPRINT-08 con el resto del contenido.
 */
export const ui = {
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Nosotros',
    'nav.services': 'Servicios',
    'nav.coverage': 'Cobertura',
    'nav.gallery': 'Galería',
    'nav.blog': 'Blog',
    'nav.faq': 'Preguntas Frecuentes',
    'nav.contact': 'Contacto',

    'cta.whatsapp': 'Cotizar por WhatsApp',
    'cta.call': 'Llamar ahora',
    'cta.email': 'Enviar email',
    'cta.viewMore': 'Ver más',
    'cta.viewServices': 'Ver servicios',

    'whatsapp.defaultMessage':
      'Hola, vi su web y necesito información sobre sus servicios de mudanza',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.services': 'Services',
    'nav.coverage': 'Coverage',
    'nav.gallery': 'Gallery',
    'nav.blog': 'Blog',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',

    'cta.whatsapp': 'Quote via WhatsApp',
    'cta.call': 'Call now',
    'cta.email': 'Send email',
    'cta.viewMore': 'View more',
    'cta.viewServices': 'View services',

    'whatsapp.defaultMessage':
      "Hi, I saw your website and need information about your moving services",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key] ?? key;
  };
}
