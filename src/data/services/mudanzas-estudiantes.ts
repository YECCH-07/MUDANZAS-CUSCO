import type { ServiceData } from '@lib/services';

export const mudanzasEstudiantes: ServiceData = {
  slug: 'mudanzas-estudiantes-cusco',
  metaTitle: 'Mudanzas para Estudiantes UNSAAC en Cusco | Expresos Ñan',
  metaDescription:
    'Mudanzas económicas para estudiantes UNSAAC en Cusco: cuartos, pensiones, mini-departamentos. Servicio express mismo día desde S/ 80. Cotiza por WhatsApp al 925 671 052.',
  ogImage: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',

  hero: {
    eyebrow: 'Estudiantes UNSAAC',
    title: 'Mudanzas para Estudiantes en Cusco',
    subtitle:
      'Servicio económico y express para cuartos, pensiones y mini-departamentos. Flexibilidad horaria, unidades pequeñas y precios claros desde S/ 80.',
    image: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
    imageAlt: 'Unidad pequeña para mudanza de estudiante UNSAAC en Cusco',
    whatsappMessage:
      'Hola, soy estudiante UNSAAC y necesito mudarme. Origen: [dirección / zona universitaria]. Destino: [dirección]. Fecha: [fecha].',
  },

  breadcrumb: 'Mudanzas para estudiantes',

  description: [
    'Sabemos cómo es: cambio de semestre, nueva pensión, la familia vive lejos y no puede ayudarte a mudar. En <strong>Expresos Ñan</strong> creamos un servicio específico para estudiantes de la UNSAAC, Andina del Cusco y otras universidades locales, con unidades pequeñas, precios transparentes y coordinación por WhatsApp.',
    'La idea es simple: tú empacas tus cajas, nosotros ponemos el transporte, los ayudantes y las mantas para proteger tus cosas en el traslado. El servicio se paga en efectivo o Yape al final, sin depósitos previos.',
  ],

  sections: [
    {
      title: 'Casos típicos que atendemos',
      paragraphs: [
        '<strong>Cambio de pensión:</strong> de una zona a otra de Cusco. La ruta más común es entre Wanchaq y San Sebastián, y hacia/desde la zona cerca de la UNSAAC.',
        '<strong>Traslado de cuarto completo:</strong> cama, escritorio, silla, ropero pequeño, cajas. Generalmente cabe en la unidad de 1 tonelada (taxi-carga) en un solo viaje.',
        '<strong>Mudanza a mini-departamento:</strong> cuando finalmente consigues tu primer departamento independiente, normalmente con algo más de mobiliario — operamos con la unidad de 2 toneladas.',
        '<strong>Regreso a ciudad de origen:</strong> mudanza a Sicuani, Abancay u otra provincia al terminar el semestre o carrera.',
        '<strong>Mudanza compartida entre amigos:</strong> si son dos o tres que se mudan en la misma zona el mismo día, coordinamos servicio conjunto con descuento.',
      ],
    },
  ],

  includes: [
    'Unidad 1 tonelada (taxi-carga, suficiente para un cuarto)',
    'Chofer + 1 ayudante',
    'Mantas para proteger muebles',
    '3-5 cajas de cartón de cortesía si no tienes',
    'Fajas para asegurar en el transporte',
    'Servicio en el mismo día según disponibilidad',
  ],

  excludes: [
    'Embalaje profesional (generalmente no se necesita para cuarto)',
    'Armado complejo de muebles (muebles simples sí incluidos)',
    'Traslado a provincias (se cotiza aparte si aplica)',
  ],

  priceTable: {
    note: 'Precios referenciales. Incluimos ayudantes, transporte y materiales básicos.',
    rows: [
      {
        label: 'Cuarto pequeño (pocas cajas + colchón)',
        price: 'S/ 80 – S/ 120',
        notes: 'Dentro de Cusco metropolitano',
      },
      {
        label: 'Cuarto completo (cama + ropero + escritorio)',
        price: 'S/ 120 – S/ 200',
        notes: 'Unidad 1 t',
      },
      { label: 'Mini-departamento', price: 'S/ 200 – S/ 400', notes: 'Unidad 2 t' },
      {
        label: 'Mudanza express mismo día (extra urgencia)',
        price: '+ S/ 30 sobre tarifa base',
        notes: 'Si tenemos disponibilidad',
      },
      {
        label: 'Regreso a provincia (Sicuani, Abancay)',
        price: 'Desde S/ 400',
        notes: 'Según destino y volumen',
      },
    ],
  },

  gallery: [
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
      alt: 'Unidad pequeña para mudanza estudiantil',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
      alt: 'Mudanza rápida para estudiante en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/ARMADO-Y-DESARMADO-DE-MUEBLES-CUSCO-MUDANZAS.jpg',
      alt: 'Desarmado de cama antes de mudanza',
    },
    {
      src: '/wp-content/uploads/2024/05/COSAS-DE-LOS-CLIENTES-CUSCO-MUDANZAS.jpg',
      alt: 'Mudanza personalizada para estudiantes',
    },
  ],

  faqs: [
    {
      q: '¿Cuánto cuesta mudar un cuarto?',
      a: 'Entre S/ 80 y S/ 200 según volumen y distancia dentro de Cusco. Un cuarto simple con pocas cajas y un colchón se resuelve desde S/ 80. Un cuarto completo con cama armable, ropero pequeño y escritorio va entre S/ 120 y S/ 200.',
    },
    {
      q: '¿Pueden venir el mismo día?',
      a: 'Sí, con disponibilidad. Si nos escribes antes del mediodía por WhatsApp, casi siempre podemos llegar esa misma tarde. Para fines de semana recomendamos coordinar con al menos 1-2 días.',
    },
    {
      q: '¿Necesito tener cajas?',
      a: 'Ayuda mucho si ya tienes tus cosas en cajas o bolsas. Si no, traemos 3-5 cajas de cortesía. Si necesitas muchas más, las podemos vender a precio justo.',
    },
    {
      q: '¿Me ayudan a bajar y subir por escaleras?',
      a: 'Sí, es parte del servicio. Si la pensión o departamento está en un 3er o 4to piso sin ascensor también, solo avísanos en la cotización para llevar un ayudante extra si el volumen lo requiere.',
    },
    {
      q: '¿Hacen mudanzas compartidas entre estudiantes?',
      a: 'Sí. Si tú y un amigo/a se mudan el mismo día a zonas cercanas, coordinamos servicio conjunto y sale más barato para ambos. Escríbenos con los dos orígenes y destinos y calculamos.',
    },
    {
      q: '¿Puedo pagar en cuotas?',
      a: 'El servicio se paga al finalizar la mudanza, en efectivo, Yape, Plin o transferencia. No manejamos crédito ni cuotas — preferimos mantener los precios bajos al no asumir costos financieros.',
    },
  ],

  related: [
    {
      title: 'Mudanzas locales',
      description: 'Si tu mudanza es más grande (no solo un cuarto), este es el servicio completo.',
      href: '/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/',
      image: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
    },
    {
      title: 'Almacenaje temporal',
      description: 'Guarda tus cosas durante las vacaciones si vuelves a provincia por un tiempo.',
      href: '/almacenaje-y-custodia-cusco/',
      image: '/wp-content/uploads/2024/05/COSAS-DE-LOS-CLIENTES-CUSCO-MUDANZAS.jpg',
    },
    {
      title: 'Cusco ↔ Sicuani',
      description: 'Regreso a provincia al terminar el semestre.',
      href: '/mudanzas-cusco-sicuani/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
    },
  ],

  ctaMessage:
    'Hola, soy estudiante y necesito mudarme. Origen: [dirección / zona]. Destino: [dirección]. Tengo: [breve inventario]. Fecha: [fecha].',
  ctaTitle: 'Cambia de pensión sin complicaciones',
  ctaSubtitle: 'Precio fijo desde S/ 80, ayudantes incluidos y respuesta rápida por WhatsApp.',

  schemaServiceType: 'Student Moving Service',
  areaServed: ['Cusco', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Santiago'],
};
