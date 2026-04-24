import { SITE } from './site';
import type { Lang } from '@/i18n/config';

/**
 * Mensajes por defecto según idioma. Cada página puede sobrescribir con un
 * mensaje contextual más específico (ej: "Hola, necesito mudanza Cusco-Sicuani").
 */
const DEFAULT_MESSAGES: Record<Lang, string> = {
  es: 'Hola, vi su web y necesito información sobre sus servicios de mudanza.',
  en: 'Hi, I saw your website and need information about your moving services.',
};

/**
 * Construye la URL wa.me con mensaje pre-armado.
 * Uso: `getWhatsAppUrl({ lang: 'es', message: 'Hola, quiero cotizar...' })`.
 */
export function getWhatsAppUrl(options: { lang: Lang; message?: string }): string {
  const text = options.message ?? DEFAULT_MESSAGES[options.lang];
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

/**
 * URL `tel:` E.164 para botón click-to-call.
 */
export function getTelUrl(): string {
  return `tel:${SITE.phoneE164}`;
}

/**
 * URL `mailto:` con asunto opcional.
 */
export function getMailUrl(subject?: string): string {
  const base = `mailto:${SITE.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
