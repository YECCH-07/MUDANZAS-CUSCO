export const languages = {
  es: 'Español',
  en: 'English',
} as const;

export const defaultLang = 'es';

export type Lang = keyof typeof languages;

export function isLang(value: string): value is Lang {
  return value in languages;
}

export function getLangFromUrl(url: URL): Lang {
  const segments = url.pathname.split('/');
  const candidate = segments[1];
  if (candidate && isLang(candidate)) return candidate;
  return defaultLang;
}
