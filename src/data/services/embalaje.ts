import type { ServiceData } from '@lib/services';

export const embalaje: ServiceData = {
  slug: 'servicio-de-embalaje-cusco',
  metaTitle: 'Servicio de Embalaje Profesional en Cusco | Expresos Ñan',
  metaDescription:
    'Embalaje profesional en Cusco: vajilla, electrónicos, obras de arte y mudanzas completas. Materiales incluidos (cajas, burbuja, film). Cotiza al 925 671 052.',
  ogImage: '/wp-content/uploads/2024/05/EMBALAJE-CUSCO.png',

  hero: {
    eyebrow: 'Embalaje profesional',
    title: 'Servicio de Embalaje y Empaque en Cusco',
    subtitle:
      'Embalamos tu casa u oficina con materiales de calidad: cajas resistentes, plástico burbuja, film y mantas. Servicio a domicilio o solo suministro de materiales.',
    image: '/wp-content/uploads/2024/05/EMBALAJE-CUSCO.png',
    imageAlt: 'Servicio de embalaje profesional en Cusco — Expreso Ñan',
    whatsappMessage:
      'Hola, necesito servicio de embalaje. ¿Qué cubren los materiales y cuál es la tarifa?',
  },

  breadcrumb: 'Embalaje',

  description: [
    'El <strong>embalaje profesional</strong> es la diferencia entre una mudanza sin incidentes y un destino lleno de piezas rotas. En Cusco, donde las calles empedradas y las subidas hacen que la vibración durante el transporte sea inevitable, proteger cada objeto con el material correcto es clave.',
    'Nuestro servicio cubre desde el embalaje completo de una casa u oficina (todo listo para ser cargado) hasta el embalaje específico de objetos delicados (vajilla, copas, electrónicos, obras de arte, instrumentos musicales). También ofrecemos venta de materiales si prefieres embalar por tu cuenta.',
  ],

  sections: [
    {
      title: 'Qué tipo de objetos embalamos',
      paragraphs: [
        '<strong>Vajilla y cristalería:</strong> cada plato en papel, intercalado vertical en caja doble fondo, relleno con papel arrugado. Copas individualmente en celdas de cartón.',
        '<strong>Electrónicos:</strong> TVs en caja original si la tienes, si no, en caja espumada con plástico antistático. CPUs y monitores con protección similar.',
        '<strong>Obras de arte y cuadros:</strong> protegidos con cartón corrugado, esquinas con foam, plástico film y finalmente caja o malla de madera para piezas grandes.',
        '<strong>Libros y documentos:</strong> cajas medianas (las grandes se rompen por el peso), con bolsa dentro para humedad.',
        '<strong>Ropa y textiles:</strong> cajas de ropa colgada para prendas finas, bolsas industriales para el resto.',
        '<strong>Instrumentos musicales:</strong> guitarras en funda dura si la tienes, pianos y baterías requieren cotización específica.',
      ],
    },
  ],

  includes: [
    'Material de embalaje completo (cajas, burbuja, film, papel, cinta)',
    'Personal capacitado en embalaje de frágiles',
    'Etiquetado por habitación/categoría',
    'Listado inventario de cajas con contenido general',
    'Servicio a domicilio en fecha coordinada',
  ],

  excludes: [
    'Limpieza de lugar tras embalaje',
    'Retiro de cajas vacías post-mudanza (coordinar aparte)',
    'Embalaje de objetos de valor extraordinario sin declaración previa',
  ],

  priceTable: {
    note: 'Precios referenciales. El costo final depende del volumen y cantidad de frágiles.',
    rows: [
      {
        label: 'Embalaje básico habitación (cajas, ropa)',
        price: 'S/ 80 – S/ 150',
        notes: 'Por habitación',
      },
      {
        label: 'Embalaje de cocina (vajilla frágil)',
        price: 'S/ 150 – S/ 300',
        notes: 'Depende del volumen',
      },
      {
        label: 'Embalaje completo casa 2-3 ambientes',
        price: 'S/ 400 – S/ 800',
        notes: 'Todo incluido',
      },
      {
        label: 'Embalaje de obra de arte / instrumento',
        price: 'S/ 50 – S/ 200',
        notes: 'Por pieza',
      },
      {
        label: 'Solo venta de materiales',
        price: 'Según lista',
        notes: 'Cajas desde S/ 3, burbuja por metro',
      },
    ],
  },

  gallery: [
    {
      src: '/wp-content/uploads/2024/05/EMBALAJE-CUSCO.png',
      alt: 'Materiales de embalaje profesional Expreso Ñan',
    },
    {
      src: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',
      alt: 'Proceso de embalaje de caja en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZA-PERSONALIZADA-CUSCO.png',
      alt: 'Embalaje personalizado en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
      alt: 'Embalaje previo a mudanza en Cusco',
    },
  ],

  faqs: [
    {
      q: '¿Cuánto cobran por embalar mi casa completa?',
      a: 'Depende del tamaño: un departamento de 2 ambientes entre S/ 400 y S/ 700, una casa de 3 habitaciones entre S/ 700 y S/ 1200. Esto incluye todos los materiales. Si combinamos con la mudanza suele haber descuento.',
    },
    {
      q: '¿Me venden solo las cajas?',
      a: 'Sí, también vendemos materiales sueltos. Cajas desde S/ 3-8 según tamaño, plástico burbuja por metro, papel kraft, film, cinta. Te llevamos a domicilio dentro de Cusco con pedido mínimo.',
    },
    {
      q: '¿Pueden embalar obras de arte o cuadros grandes?',
      a: 'Sí, tenemos experiencia con arte enmarcado, cuadros al óleo, esculturas pequeñas y espejos grandes. Para piezas de alto valor hacemos declaración previa y embalaje con malla de madera a medida.',
    },
    {
      q: '¿Cuánto tardan en embalar?',
      a: 'Un departamento de 2 ambientes suele tomar 4-6 horas. Una casa completa 8-12 horas. Si tienes mucha vajilla frágil o colección, sumamos tiempo adicional.',
    },
    {
      q: '¿Hacen inventario?',
      a: 'Sí, entregamos un listado de cajas con contenido general (ej: Caja 12 — dormitorio principal — ropa y accesorios). Si necesitas inventario detallado por objeto (por ejemplo para seguros), se cotiza aparte.',
    },
  ],

  related: [
    {
      title: 'Mudanzas locales',
      description: 'Combina embalaje con mudanza completa y obtén descuento.',
      href: '/mudanzas-locales-en-cusco-expresos-nan-servicio-rapido-seguro-y-eficiente/',
      image: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
    },
    {
      title: 'Mudanzas de oficina',
      description: 'Embalaje antistático para equipos electrónicos.',
      href: '/mudanzas-de-o/',
      image: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',
    },
    {
      title: 'Almacenaje',
      description: 'Si guardas pertenencias, el embalaje es clave para evitar daños.',
      href: '/almacenaje-y-custodia-cusco/',
      image: '/wp-content/uploads/2024/05/MUDANZA-PERSONALIZADA-CUSCO.png',
    },
  ],

  ctaMessage:
    'Hola, necesito servicio de embalaje. Tengo aproximadamente [X] ambientes / [X] cajas estimadas. ¿Me pueden cotizar?',
  ctaTitle: 'Embala tus cosas con quien sabe',
  ctaSubtitle: 'Materiales incluidos, personal capacitado y garantía de cuidado con cada pieza.',

  schemaServiceType: 'Packing Service',
  areaServed: ['Cusco', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Santiago'],
};
