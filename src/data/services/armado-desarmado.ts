import type { ServiceData } from '@lib/services';

export const armadoDesarmado: ServiceData = {
  slug: 'armado-y-desarmado-de-muebles-cusco',
  metaTitle: 'Armado y Desarmado de Muebles en Cusco | Expresos Ñan',
  metaDescription:
    'Servicio profesional de armado y desarmado de muebles en Cusco: camas, roperos, escritorios, racks de TV. Herramientas propias, garantía y tarifa por mueble. Cotiza al 925 671 052.',
  ogImage: '/wp-content/uploads/2024/05/ARMADO-Y-DESARMADO-DE-MUEBLES-CUSCO-MUDANZAS.jpg',

  hero: {
    eyebrow: 'Armado y desarmado',
    title: 'Armado y Desarmado de Muebles en Cusco',
    subtitle:
      'Armamos y desarmamos todo tipo de muebles con herramientas propias y personal capacitado. Servicio independiente o como parte de tu mudanza.',
    image: '/wp-content/uploads/2024/05/ARMADO-Y-DESARMADO-DE-MUEBLES-CUSCO-MUDANZAS.jpg',
    imageAlt: 'Personal de Expreso Ñan desarmando muebles en Cusco',
    whatsappMessage:
      'Hola, necesito armado/desarmado de [tipo de mueble]. ¿Me pueden cotizar el servicio?',
  },

  breadcrumb: 'Armado y desarmado de muebles',

  description: [
    'El <strong>armado y desarmado de muebles</strong> es uno de los dolores de cabeza más comunes en las mudanzas: ¿las piezas de la cama se volverán a armar igual?, ¿se perdieron los tornillos?, ¿cómo desmontar el ropero empotrado sin dañarlo? Nuestro equipo lo hace a diario y trae todas las herramientas necesarias.',
    'Ofrecemos este servicio dentro de una mudanza completa (incluido sin costo extra para muebles estándar) o como servicio independiente cuando compraste un mueble nuevo o necesitas desarmar algo para llevar a remodelación.',
  ],

  includes: [
    'Personal capacitado con experiencia en armado',
    'Herramientas completas (destornilladores, llaves, taladro, nivel)',
    'Organización y embolsado de tornillería al desarmar',
    'Limpieza básica del lugar al terminar',
    'Garantía: si algo se arma mal, volvemos a solucionarlo',
  ],

  excludes: [
    'Suministro de piezas perdidas (cliente debe tener tornillos y manual si aplica)',
    'Muebles a medida con indicaciones del fabricante no disponibles',
    'Instalación de sistemas eléctricos especiales',
  ],

  priceTable: {
    note: 'Precios referenciales por pieza. Si son varios muebles en la misma visita, hay descuento acumulado.',
    rows: [
      { label: 'Cama 1 plaza / 1½ plaza', price: 'S/ 40 – S/ 80', notes: 'Armado o desarmado' },
      { label: 'Cama 2 plazas o matrimonial', price: 'S/ 60 – S/ 120', notes: '' },
      { label: 'Ropero / closet modular', price: 'S/ 80 – S/ 250', notes: 'Según tamaño' },
      { label: 'Escritorio / mesa de computadora', price: 'S/ 40 – S/ 100', notes: '' },
      { label: 'Rack de TV / centro de entretenimiento', price: 'S/ 60 – S/ 150', notes: '' },
      {
        label: 'Estación de trabajo modular (oficina)',
        price: 'S/ 80 – S/ 180',
        notes: 'Por estación',
      },
    ],
  },

  gallery: [
    {
      src: '/wp-content/uploads/2024/05/ARMADO-Y-DESARMADO-DE-MUEBLES-CUSCO-MUDANZAS.jpg',
      alt: 'Armado de muebles en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg',
      alt: 'Desarmado profesional de muebles en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
      alt: 'Equipo de Expreso Ñan trabajando en mudanza',
    },
    {
      src: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',
      alt: 'Preparación previa al armado en mudanza',
    },
  ],

  faqs: [
    {
      q: '¿Cuánto cobran por armar una cama?',
      a: 'Camas de 1 o 1½ plazas entre S/ 40 y S/ 80. Camas de 2 plazas o matrimoniales entre S/ 60 y S/ 120. Si es cama con cajones o almacenamiento integrado se cotiza un poco más por la complejidad.',
    },
    {
      q: '¿Arman muebles de tienda (tipo Sodimac, Promart, Ikea)?',
      a: 'Sí, es uno de nuestros casos más frecuentes. Traemos las herramientas — solo necesitamos el mueble en caja y las instrucciones del fabricante. Si falta un tornillo o pieza, interrumpimos y cotizamos cuando tengas el repuesto.',
    },
    {
      q: '¿Y si es un mueble antiguo sin manual?',
      a: 'Lo desarmamos tomando fotos de cada paso y embolsando la tornillería por pieza. Al armar de vuelta seguimos las fotos inversas. Sí, nos ha tocado armar muebles históricos sin manual — es más lento pero se resuelve.',
    },
    {
      q: '¿Dan garantía?',
      a: 'Sí. Si tras armar algo queda flojo, inestable o con piezas mal ensambladas, volvemos sin costo dentro de los 7 días siguientes. La garantía no cubre daños causados por uso indebido posterior (ej: recargar peso excesivo sobre el mueble).',
    },
    {
      q: '¿Cuánto tiempo toma?',
      a: 'Una cama: 30-45 min. Un ropero modular grande: 1-3 horas. Una oficina con 10 estaciones modulares: 1 día de trabajo completo.',
    },
  ],

  related: [
    {
      title: 'Mudanzas locales',
      description: 'Armado y desarmado incluidos gratis para mudanzas locales estándar.',
      href: '/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/',
      image: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
    },
    {
      title: 'Mudanzas de oficina',
      description: 'Desarme y armado de estaciones modulares en fin de semana.',
      href: '/mudanzas-de-o/',
      image: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',
    },
    {
      title: 'Servicio de flete',
      description: 'Combina flete + armado para mueble nuevo comprado en tienda.',
      href: '/servicio-de-flete-cusco/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
    },
  ],

  ctaMessage:
    'Hola, necesito armado/desarmado de muebles. Tengo: [lista de muebles]. Dirección: [dirección]. ¿Me pueden cotizar?',
  ctaTitle: '¿Compraste un mueble nuevo y necesitas ayuda?',
  ctaSubtitle: 'Llegamos con las herramientas y lo dejamos armado en horas.',

  schemaServiceType: 'Furniture Assembly Service',
  areaServed: ['Cusco', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Santiago'],
};
