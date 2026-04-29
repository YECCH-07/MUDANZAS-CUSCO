import type { Session, User } from '@db/schema';

type SafeUser = Omit<User, 'passwordHash' | 'totpSecret'>;

declare global {
  namespace App {
    interface Locals {
      /** Usuario autenticado (null en rutas públicas). */
      user: SafeUser | null;
      /** Sesión activa (null en rutas públicas). */
      session: Session | null;
    }
  }

  interface Window {
    /** Bandera anti-doble-init del bundle de mejoras del panel. */
    __panelEnhancementsInit?: boolean;
  }
}

interface ImportMetaEnv {
  readonly WEB3FORMS_ACCESS_KEY?: string;
  // Panel interno — variables Node-only (no usar desde cliente).
  readonly DATABASE_URL?: string;
  readonly SESSION_COOKIE_NAME?: string;
  readonly SESSION_COOKIE_SECURE?: string;
  readonly SITE_URL?: string;
  readonly TZ?: string;
  readonly B2_KEY_ID?: string;
  readonly B2_APPLICATION_KEY?: string;
  readonly B2_ENDPOINT?: string;
  readonly B2_BUCKET_FOTOS?: string;
  readonly B2_BUCKET_DOCS?: string;
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_SECURE?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASSWORD?: string;
  readonly SMTP_FROM_NAME?: string;
  readonly SMTP_FROM_ADDRESS?: string;
}

// Augment Astro's ImportMeta with our env keys.
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
