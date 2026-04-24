/**
 * Estructura común de cada página de servicio.
 * ServiceLayout consume este tipo para renderizar hero, descripción, precios,
 * FAQs, Schema.org Service+FAQPage, breadcrumbs y CTAs — todo homogéneo.
 */

export interface PriceRow {
  label: string;
  price: string;
  notes?: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface RelatedService {
  title: string;
  href: string;
  image: string;
  description: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface ServiceData {
  /** Slug URL, sin trailing slash. Ej: "mudanzas-locales-en-cusco-..." */
  slug: string;
  /** Meta title (≤65 chars). No tocar en URLs preservadas. */
  metaTitle: string;
  /** Meta description (≤170 chars). */
  metaDescription: string;
  /** Imagen Open Graph específica del servicio. */
  ogImage: string;

  /** Hero */
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: string;
    imageAlt: string;
    whatsappMessage: string;
  };

  /** Breadcrumb label (no link porque es página actual). */
  breadcrumb: string;

  /** Descripción detallada en párrafos (cuerpo principal). */
  description: string[];

  /** Secciones adicionales con H2 opcionales. */
  sections?: {
    title: string;
    paragraphs: string[];
  }[];

  /** Qué incluye el servicio. */
  includes: string[];

  /** Qué NO incluye (opcional, para transparencia). */
  excludes?: string[];

  /** Tabla de precios referenciales. Marcar "pendiente de confirmación" hasta que el cliente apruebe. */
  priceTable?: {
    note?: string;
    rows: PriceRow[];
  };

  /** 4-6 fotos del servicio. */
  gallery?: GalleryImage[];

  /** 4-6 preguntas frecuentes, usadas también para Schema FAQPage. */
  faqs: FAQ[];

  /** 3 servicios relacionados para internal linking. */
  related: RelatedService[];

  /** Mensaje WhatsApp contextual del servicio. */
  ctaMessage: string;

  /** Texto del CTA final. */
  ctaTitle: string;
  ctaSubtitle?: string;

  /** Schema.org serviceType (ej: "Moving Service"). */
  schemaServiceType: string;

  /** Provincias/ciudades atendidas (Schema areaServed). */
  areaServed: string[];
}
