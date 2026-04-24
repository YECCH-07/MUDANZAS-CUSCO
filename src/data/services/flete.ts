import type { ServiceData } from '@lib/services';

export const flete: ServiceData = {
  slug: 'servicio-de-flete-cusco',
  metaTitle: 'Servicio de Flete y Carga en Cusco | Expresos Ñan',
  metaDescription:
    'Servicio de flete en Cusco: transporte de mercadería, muebles, electrodomésticos y carga general. Unidades de 1, 2 y 4 toneladas. Local y provincial. Cotiza al 925 671 052.',
  ogImage: '/wp-content/uploads/2024/05/MUDANZAS-CUSCO.png',

  hero: {
    eyebrow: 'Flete y carga',
    title: 'Servicio de Flete y Carga en Cusco',
    subtitle:
      'Transporte de muebles individuales, electrodomésticos, mercadería comercial y carga general. Servicio express local y a provincias del sur.',
    image: '/wp-content/uploads/2024/05/MUDANZAS-CUSCO.png',
    imageAlt: 'Servicio de flete y carga en Cusco — Expreso Ñan',
    whatsappMessage:
      'Hola, necesito flete para [descripción de la carga]. Origen: [dirección]. Destino: [dirección]. ¿Me pueden cotizar?',
  },

  breadcrumb: 'Flete y carga',

  description: [
    'El <strong>servicio de flete en Cusco</strong> es para esos traslados que no son una mudanza completa pero sí requieren una unidad profesional: un refrigerador nuevo desde la tienda a tu casa, el traslado de mercadería entre puntos de venta, una cómoda comprada por Facebook Marketplace, el mobiliario de un evento puntual.',
    'Usamos las mismas unidades que para mudanzas (1, 2 y 4 toneladas), con personal de carga y descarga. Cotizamos por viaje, no por hora, así no te preocupas si el destino tiene escaleras o acceso complicado.',
  ],

  sections: [
    {
      title: 'Qué tipos de carga movemos',
      paragraphs: [
        '<strong>Electrodomésticos nuevos o de segunda mano:</strong> refrigeradoras, lavadoras, cocinas, hornos. Incluimos protección con mantas y desconexión básica si lo requiere.',
        '<strong>Muebles individuales:</strong> cama, sofá, ropero, mesa de comedor, escritorios. Con personal para cargue y armado si es necesario.',
        '<strong>Mercadería comercial:</strong> para comerciantes que mueven productos entre tienda y almacén, o entre mercados (p. ej. Mercado San Pedro, Mercado Ttio). Si el flete es recurrente, considera nuestro <a href="/flete-comercial-cusco/" class="text-primary underline">plan comercial con descuento</a>.',
        '<strong>Carga de eventos:</strong> traslado de carpas, sillas, mesas, equipos de sonido para eventos puntuales. Entrega y recojo el mismo día.',
        '<strong>Insumos y materiales de construcción:</strong> transportamos sacos, maderas, tubos, no muy pesados ni peligrosos (no hacemos concreto fresco ni combustibles).',
      ],
    },
  ],

  includes: [
    'Unidad de 1, 2 o 4 toneladas según volumen',
    'Chofer profesional',
    '1-2 ayudantes para carga y descarga',
    'Mantas de protección',
    'Fajas para asegurar en el camión',
    'Entrega directa al domicilio o punto acordado',
  ],

  excludes: [
    'Embalaje profesional (servicio aparte si lo necesitas)',
    'Carga peligrosa (combustibles, químicos, explosivos)',
    'Carga perecedera sin refrigeración propia',
    'Armado o instalación de equipos especiales',
  ],

  priceTable: {
    note: 'Precios referenciales por viaje dentro de Cusco metropolitano. Servicio provincial se cotiza aparte.',
    rows: [
      {
        label: 'Flete express (1-2 muebles, unidad 1 t)',
        price: 'S/ 80 – S/ 150',
        notes: 'Viaje simple dentro de Cusco',
      },
      {
        label: 'Flete mediano (varios muebles o electrodomésticos)',
        price: 'S/ 150 – S/ 300',
        notes: 'Unidad 2 t',
      },
      {
        label: 'Flete grande (carga de camión completo)',
        price: 'S/ 300 – S/ 600',
        notes: 'Unidad 4 t',
      },
      {
        label: 'Flete ida y vuelta el mismo día',
        price: 'Cotización según tiempo',
        notes: 'Descuento por contrato por hora',
      },
    ],
  },

  gallery: [
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',
      alt: 'Unidad de 4 toneladas para servicio de flete en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
      alt: 'Unidad de 2 toneladas para flete en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-CUSCO.png',
      alt: 'Servicio de flete con Expreso Ñan',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
      alt: 'Flete de muebles en Cusco',
    },
  ],

  faqs: [
    {
      q: '¿Cuánto cuesta un flete dentro de Cusco?',
      a: 'Un flete simple (1-2 muebles) desde S/ 80. Un flete mediano con varios electrodomésticos desde S/ 150. Para carga de camión completo desde S/ 300. El precio depende del volumen y distancia dentro del área metropolitana.',
    },
    {
      q: '¿Cuánto tardan en llegar?',
      a: 'Si cotizamos por WhatsApp antes del mediodía, podemos llegar el mismo día según disponibilidad. Para el día siguiente la disponibilidad es casi siempre garantizada. En temporada alta (diciembre, fin de mes) recomendamos agendar con 1-2 días de anticipación.',
    },
    {
      q: '¿Ayudan a cargar o solo transportan?',
      a: 'Siempre incluimos 1 o 2 ayudantes para cargar y descargar. No es necesario que tú cargues ni consigas gente extra. Si la carga es muy pesada (más de 200 kg por pieza) avísanos para llevar equipo de apoyo.',
    },
    {
      q: '¿Hacen fletes a provincias?',
      a: 'Sí. Fletes a Sicuani, Abancay o las rutas a Apurímac y Chumbivilcas los cotizamos por ruta específica. Ver las páginas de cada ruta para tiempos y precios referenciales.',
    },
    {
      q: '¿Puedo contratar por hora?',
      a: 'Sí, para casos como retiro y devolución de mobiliario de evento, o mudanzas múltiples pequeñas en un día. Cotizamos con tarifa por hora de unidad más personal.',
    },
    {
      q: '¿Emiten factura?',
      a: 'Sí. Boleta para personas naturales, factura con RUC para empresas. Para flete comercial recurrente coordinamos facturación mensual acumulada.',
    },
  ],

  related: [
    {
      title: 'Flete comercial recurrente',
      description: 'Rutas fijas semanales o mensuales con descuento por frecuencia.',
      href: '/flete-comercial-cusco/',
      image: '/wp-content/uploads/2024/05/SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg',
    },
    {
      title: 'Mudanzas locales',
      description: 'Si es mudanza completa (no solo flete), este es el servicio correcto.',
      href: '/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/',
      image: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
    },
    {
      title: 'Nuestra flota',
      description: 'Conoce las unidades disponibles para tu flete.',
      href: '/flota-de-camiones-cusco/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',
    },
  ],

  ctaMessage:
    'Hola, necesito flete para [descripción de la carga]. Origen: [dirección]. Destino: [dirección]. Fecha: [fecha].',
  ctaTitle: 'Cotiza tu flete ahora',
  ctaSubtitle: 'Respondemos en minutos por WhatsApp con precio cerrado.',

  schemaServiceType: 'Freight Transport Service',
  areaServed: [
    'Cusco',
    'Wanchaq',
    'San Sebastián',
    'San Jerónimo',
    'Santiago',
    'Saylla',
    'Poroy',
    'Pisac',
    'Calca',
    'Urubamba',
    'Chinchero',
    'Ollantaytambo',
    'Anta',
    'Urcos',
    'Oropesa',
    'Sicuani',
    'Abancay',
  ],
};
