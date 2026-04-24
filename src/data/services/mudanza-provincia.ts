import type { ServiceData } from '@lib/services';

export const mudanzaProvincia: ServiceData = {
  slug: 'mudanza-provincia',
  metaTitle: 'Mudanzas Inter-Provincia desde Cusco | Expresos Ñan',
  metaDescription:
    'Mudanzas inter-provinciales desde Cusco: Sicuani, Abancay, Challhuahuacho, Tambobamba, Haquira, Mara, Coyllurqui, Colquemarca y Capacmarca. 9 rutas activas. Cotiza al 925 671 052.',
  ogImage: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',

  hero: {
    eyebrow: 'Mudanzas inter-provincia',
    title: 'Mudanzas Inter-Provinciales desde Cusco',
    subtitle:
      'Servicio activo hacia 9 destinos en Apurímac, Canchis y Chumbivilcas. Especialistas en la ruta Cusco ↔ Las Bambas (Challhuahuacho, Tambobamba, Haquira, Mara, Coyllurqui).',
    image: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',
    imageAlt: 'Unidad Expreso Ñan preparada para mudanza inter-provincial desde Cusco',
    whatsappMessage:
      'Hola, necesito mudanza inter-provincial. Origen: Cusco. Destino: [ciudad]. Volumen: [detalle].',
  },

  breadcrumb: 'Mudanzas inter-provincia',

  description: [
    'Las <strong>mudanzas inter-provinciales desde Cusco</strong> son una de nuestras especialidades. Mantenemos rutas regulares hacia las principales ciudades del sur del Perú y zonas de operación minera, con unidades adaptadas para trayectos de 3 a 12 horas y choferes que conocen cada ruta en detalle.',
    'A diferencia de las mudanzas locales, los traslados entre provincias requieren planificación adicional: documentación para puntos de control, consideración del clima en rutas de altura (pasos de más de 4000 msnm), descansos del chofer y protección reforzada de la carga para caminos en condiciones variadas. Todo eso ya lo tenemos resuelto en nuestro proceso.',
  ],

  sections: [
    {
      title: 'Rutas activas (operamos hoy)',
      paragraphs: [
        '<strong>Cusco ↔ Sicuani</strong> (138 km, 3 h) — provincia de Canchis. Ruta asfaltada estable. <a href="/mudanzas-cusco-sicuani/" class="text-primary underline">Ver detalle</a>',
        '<strong>Cusco ↔ Abancay</strong> (195 km, 5 h) — capital de Apurímac. <a href="/mudanzas-cusco-abancay/" class="text-primary underline">Ver detalle</a>',
        '<strong>Cusco ↔ Challhuahuacho</strong> (425 km, 10-12 h) — centro operativo de Las Bambas, Cotabambas. <a href="/mudanzas-cusco-challhuahuacho/" class="text-primary underline">Ver detalle</a>',
        '<strong>Cusco ↔ Tambobamba</strong> (380 km, 9-10 h) — Cotabambas, Apurímac.',
        '<strong>Cusco ↔ Haquira</strong> (400 km, 9-10 h) — Cotabambas, Apurímac.',
        '<strong>Cusco ↔ Mara</strong> (360 km, 8-9 h) — Cotabambas, Apurímac.',
        '<strong>Cusco ↔ Coyllurqui</strong> (350 km, 8-9 h) — Cotabambas, Apurímac.',
        '<strong>Cusco ↔ Colquemarca</strong> (280 km, 7-8 h) — Chumbivilcas, Cusco.',
        '<strong>Cusco ↔ Capacmarca</strong> (300 km, 7-8 h) — Chumbivilcas, Cusco.',
      ],
    },
    {
      title: 'Rutas próximamente',
      paragraphs: [
        'Estamos preparando la apertura de rutas adicionales. Si necesitas alguna de estas, déjanos tus datos en la landing correspondiente y te avisaremos cuando esté operativa:',
        '<strong>Cusco ↔ Arequipa</strong> (bidireccional, 521 km) — próximamente.',
        '<strong>Cusco → Juliaca</strong> (340 km) — próximamente.',
        '<strong>Cusco → Puno</strong> (388 km) — próximamente.',
      ],
    },
    {
      title: 'Rutas que NO atendemos',
      paragraphs: [
        'Actualmente no operamos las rutas Cusco ↔ Lima ni Cusco ↔ Espinar/Quillabamba. Si necesitas alguna de estas, podemos recomendarte alternativas serias, pero nosotros no las ofrecemos.',
      ],
    },
  ],

  includes: [
    'Unidad dedicada (no carga compartida salvo acuerdo)',
    'Chofer con licencia y conocimiento de la ruta',
    'Protección con mantas, fajas y plástico film',
    'Cajas básicas de cartón si lo necesitas',
    'Coordinación de documentación para puntos de control',
    'Armado y desarmado de muebles estándar',
    'Entrega directa al domicilio o campamento en destino',
  ],

  excludes: [
    'Embalaje profesional de frágiles (servicio adicional)',
    'Permisos especiales de carga peligrosa',
    'Peajes extraordinarios fuera de ruta estándar (se consultan antes)',
  ],

  priceTable: {
    note: 'Precios referenciales por unidad dedicada (ida). Varía según volumen y temporada. Rango amplio porque un mismo destino tiene distancia fija pero diferencia según unidad (1, 2 o 4 toneladas) y servicios adicionales.',
    rows: [
      {
        label: 'Cusco ↔ Sicuani',
        price: 'S/ 600 – S/ 1400',
        notes: 'Ida, unidad 1-4 t',
      },
      {
        label: 'Cusco ↔ Abancay',
        price: 'S/ 900 – S/ 1800',
        notes: 'Ida, unidad 1-4 t',
      },
      {
        label: 'Cusco ↔ Challhuahuacho / Tambobamba',
        price: 'S/ 1800 – S/ 3200',
        notes: 'Ida, unidad 2-4 t',
      },
      {
        label: 'Cusco ↔ Colquemarca / Capacmarca',
        price: 'S/ 1200 – S/ 2500',
        notes: 'Ida, unidad 2-4 t',
      },
    ],
  },

  gallery: [
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',
      alt: 'Unidad de 4 toneladas para mudanzas inter-provinciales',
    },
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
      alt: 'Unidad de 2 toneladas para rutas provinciales',
    },
    {
      src: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',
      alt: 'Embalaje reforzado para mudanzas inter-provinciales',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
      alt: 'Carga de departamento para mudanza provincial',
    },
  ],

  faqs: [
    {
      q: '¿Cuánto tarda una mudanza a provincias?',
      a: 'Depende del destino: Sicuani 3 horas, Abancay 5 horas, Challhuahuacho 10-12 horas. A esto súmale 2-4 horas de carga en origen y 1-2 horas de descarga en destino. Una mudanza a Las Bambas suele tomar un día completo.',
    },
    {
      q: '¿Atienden a personal de minas (Las Bambas, por ejemplo)?',
      a: 'Sí, tenemos experiencia con personal del sector minero. Coordinamos con los turnos de los trabajadores y entregamos en campamentos o viviendas en Challhuahuacho, Tambobamba, Mara, Haquira y Coyllurqui. También emitimos factura con RUC si la empresa paga la mudanza.',
    },
    {
      q: '¿La carga va asegurada?',
      a: 'Tomamos todas las medidas de protección física (mantas, fajas, plástico, amarres). Para coberturas de seguro formal podemos coordinar con aseguradoras locales si el cliente lo solicita. La tarifa estándar incluye nuestra responsabilidad contractual, no seguro de terceros.',
    },
    {
      q: '¿Cómo se paga una mudanza a provincias?',
      a: 'Solicitamos un adelanto del 30-50% para confirmar la reserva y el saldo al finalizar la entrega en destino. Aceptamos efectivo, transferencia, Yape y Plin. Para empresas emitimos factura con crédito acordado.',
    },
    {
      q: '¿Hacen ruta de regreso (provincia → Cusco)?',
      a: 'Sí, atendemos ambos sentidos. Si necesitas mudarte desde Abancay, Sicuani o cualquiera de los destinos de Apurímac hacia Cusco, el servicio es el mismo — solo cambia el origen.',
    },
    {
      q: '¿Qué pasa si hay bloqueo en la ruta?',
      a: 'Monitoreamos la situación de carreteras constantemente (especialmente las rutas a Cotabambas que a veces tienen protestas). Si hay bloqueo anunciado reprogramamos la fecha sin cargo. Si surge durante el viaje, coordinamos rutas alternativas o esperamos en el punto más seguro.',
    },
  ],

  related: [
    {
      title: 'Ruta Cusco ↔ Sicuani',
      description: 'Landing específica de la ruta Canchis.',
      href: '/mudanzas-cusco-sicuani/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
    },
    {
      title: 'Ruta Cusco ↔ Challhuahuacho',
      description: 'Ruta a Las Bambas (Cotabambas, Apurímac).',
      href: '/mudanzas-cusco-challhuahuacho/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',
    },
    {
      title: 'Nuestra flota',
      description: 'Unidades de 1, 2 y 4 toneladas con choferes profesionales.',
      href: '/flota-de-camiones-cusco/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
    },
  ],

  ctaMessage:
    'Hola, necesito mudanza inter-provincial. Origen: [ciudad]. Destino: [ciudad]. Volumen aproximado: [detalle].',
  ctaTitle: '¿A qué provincia necesitas mudarte?',
  ctaSubtitle: 'Te cotizamos por WhatsApp con el precio exacto por ruta.',

  schemaServiceType: 'Long Distance Moving',
  areaServed: [
    'Sicuani',
    'Abancay',
    'Challhuahuacho',
    'Tambobamba',
    'Haquira',
    'Mara',
    'Coyllurqui',
    'Colquemarca',
    'Capacmarca',
  ],
};
