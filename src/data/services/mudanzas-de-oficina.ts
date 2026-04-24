import type { ServiceData } from '@lib/services';

export const mudanzasDeOficina: ServiceData = {
  slug: 'mudanzas-de-o',
  metaTitle: 'Mudanzas de Oficina en Cusco | Expresos Ñan — Servicio Empresarial',
  metaDescription:
    'Mudanzas de oficina en Cusco con fin de semana, factura electrónica RUC, desarme y embalaje de equipos. Mínimo impacto en tu operación. Cotiza al 925 671 052.',
  ogImage: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',

  hero: {
    eyebrow: 'Mudanzas de oficina',
    title: 'Mudanzas de Oficina en Cusco — Servicio Empresarial',
    subtitle:
      'Trasladamos tu oficina con mínimo impacto en la operación: trabajos de fin de semana o nocturnos, embalaje de equipos sensibles, factura con RUC y confidencialidad total.',
    image: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',
    imageAlt: 'Mudanza de oficina en Cusco — embalaje de equipos con Expreso Ñan',
    whatsappMessage:
      'Hola, necesito cotización para mudanza de oficina. Somos [empresa] con [X] empleados, ubicados en [dirección]. Queremos mudarnos a [dirección]. Fecha tentativa: [fecha].',
  },

  breadcrumb: 'Mudanzas de oficina',

  description: [
    'Las <strong>mudanzas de oficina</strong> tienen requerimientos distintos a las familiares. La prioridad es minimizar el tiempo de inactividad: cada hora que tus colaboradores no pueden trabajar cuesta dinero. En Expresos Ñan diseñamos cada mudanza empresarial para que el lunes siguiente puedan arrancar la operación en el nuevo local como si nada hubiera pasado.',
    'Trabajamos con empresas del sector minero, estudios de abogados, oficinas de ingeniería, consultoras, clínicas pequeñas y startups. Desde oficinas de 5 personas hasta pisos completos de 80+ estaciones de trabajo. Con todos usamos el mismo proceso estructurado y entregamos cronograma por escrito antes de la mudanza.',
  ],

  sections: [
    {
      title: 'Por qué elegirnos para tu mudanza empresarial',
      paragraphs: [
        '<strong>Trabajo en fin de semana o nocturno.</strong> Coordinamos para que lleguemos al cierre del viernes, desmontemos y traslademos durante el fin de semana, e instalemos todo para que el lunes la operación continúe normal. Sin horas facturables perdidas.',
        '<strong>Embalaje especializado de equipos.</strong> Monitores, CPUs, servidores, impresoras multifuncionales, archivadores metálicos, muebles modulares. Cada equipo se embala según sus características: antistático para electrónicos, amortiguación para frágiles, etiquetado individual para reconexión rápida.',
        '<strong>Factura electrónica con RUC.</strong> Emisión inmediata al pago. Trabajamos con cotización formal previa (con forma de pago, crédito si aplica, y cronograma detallado).',
        '<strong>Confidencialidad.</strong> Si tu mudanza involucra documentación sensible (estudios legales, contabilidad, recursos humanos), firmamos acuerdo de confidencialidad con nuestro personal. El equipo destinado a tu mudanza puede ser el mismo de inicio a fin para evitar rotación.',
        '<strong>Planimetría en destino.</strong> Si nos envías el plano de la nueva oficina con las ubicaciones asignadas, nuestro equipo instala cada cosa en su lugar sin necesidad de tu supervisión en el destino.',
      ],
    },
    {
      title: 'Caso típico de mudanza empresarial',
      paragraphs: [
        '<strong>Día -7:</strong> visita técnica sin costo para relevar volumen real, validar accesos (ascensor, escaleras, estacionamiento) y entregar cotización formal con cronograma.',
        '<strong>Día -3:</strong> entregamos cajas numeradas y etiquetas para que tu equipo pueda ir pre-embalando documentos y efectos personales si lo desean.',
        '<strong>Día 0 (viernes 18:00):</strong> llega nuestro equipo. Desmontamos estaciones, embalamos equipos, etiquetamos todo. Suele tomar 4-8 horas según volumen.',
        '<strong>Sábado:</strong> transporte al nuevo local. Descarga ordenada por área (según planos). Armado de estaciones y reconexión de equipos. El equipo de TI puede venir a validar.',
        '<strong>Domingo:</strong> ajustes finales, reubicación de muebles menores según feedback del cliente.',
        '<strong>Lunes 8:00:</strong> tus colaboradores ingresan al nuevo local y encuentran sus estaciones funcionando.',
      ],
    },
  ],

  includes: [
    'Visita técnica previa sin costo',
    'Cotización formal con cronograma',
    'Cajas rotuladas y etiquetas por área/persona',
    'Desmontaje de estaciones modulares',
    'Embalaje antistático para electrónicos',
    'Protección de archivadores y muebles metálicos',
    'Traslado en horario acordado (fin de semana, nocturno)',
    'Armado en destino según planimetría provista',
    'Personal con acuerdo de confidencialidad (si aplica)',
    'Factura electrónica con RUC',
  ],

  excludes: [
    'Reconexión eléctrica especializada (coordinar con tu técnico)',
    'Configuración de red/servidores (responsabilidad del área TI del cliente)',
    'Traslado de caja fuerte pesada (se cotiza aparte con equipo especial)',
    'Eliminación de muebles viejos (podemos coordinar pero se cotiza aparte)',
  ],

  priceTable: {
    note: 'Precios referenciales para mudanzas dentro de Cusco metropolitano, en fin de semana. Rutas provinciales se cotizan aparte.',
    rows: [
      {
        label: 'Oficina pequeña (hasta 8 estaciones)',
        price: 'S/ 1200 – S/ 2000',
        notes: 'Un turno de fin de semana',
      },
      {
        label: 'Oficina mediana (9-20 estaciones)',
        price: 'S/ 2000 – S/ 3500',
        notes: 'Fin de semana completo',
      },
      {
        label: 'Oficina grande (20-50 estaciones)',
        price: 'S/ 3500 – S/ 6000',
        notes: 'Dos unidades, fin de semana',
      },
      {
        label: 'Piso completo (50+ estaciones)',
        price: 'Cotización a medida',
        notes: 'Requiere visita técnica',
      },
    ],
  },

  gallery: [
    {
      src: '/wp-content/uploads/2024/05/SERVICIO-DE-EMBALAJE-Y-MUDANZAS-CUSCO.jpg',
      alt: 'Embalaje profesional de equipos de oficina en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg',
      alt: 'Desarmado de muebles modulares en oficina',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
      alt: 'Mudanza de oficina en Cusco',
    },
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
      alt: 'Unidad de 2 toneladas para mudanzas empresariales',
    },
  ],

  faqs: [
    {
      q: '¿Cuánto tiempo toma una mudanza de oficina?',
      a: 'Una oficina pequeña (8 estaciones) se resuelve en un fin de semana. Oficinas medianas (20 estaciones) requieren 2-3 días con inicio viernes al cierre. Oficinas grandes pueden necesitar cronograma por áreas a lo largo de varios fines de semana.',
    },
    {
      q: '¿Pueden hacerlo sin parar la operación?',
      a: 'Sí, eso es precisamente nuestro enfoque. Trabajamos en fines de semana, horario nocturno o feriados. Si tu operación es 24/7, coordinamos traslado por áreas de forma escalonada.',
    },
    {
      q: '¿Qué pasa con los datos y equipos de TI?',
      a: 'Embalamos físicamente los equipos con protección antistática. La responsabilidad de backup de datos, desmontaje lógico de servidores y reconfiguración de red queda a cargo de tu equipo de TI — se coordina el cronograma para que puedan hacer su parte antes del traslado y reconectar en destino.',
    },
    {
      q: '¿Emiten factura con RUC?',
      a: 'Sí, factura electrónica SUNAT al momento del pago. Si necesitas factura con crédito (por ejemplo 15 o 30 días) lo acordamos en la cotización formal.',
    },
    {
      q: '¿Firman acuerdo de confidencialidad?',
      a: 'Sí. Para estudios de abogados, consultoras, contabilidad, recursos humanos y cualquier caso donde haya documentación sensible, firmamos NDA con la empresa y con el personal destinado a tu mudanza.',
    },
    {
      q: '¿Hacen mudanzas de oficina a provincias?',
      a: 'Sí, si la empresa es del sector minero u otro rubro provincial, coordinamos mudanza completa incluyendo Cusco → Challhuahuacho, Abancay, Sicuani u otros destinos. Se cotiza según volumen y ruta.',
    },
  ],

  related: [
    {
      title: 'Servicio de embalaje',
      description: 'Embalaje profesional antistático para equipos electrónicos.',
      href: '/servicio-de-embalaje-cusco/',
      image: '/wp-content/uploads/2024/05/EMBALAJE-CUSCO.png',
    },
    {
      title: 'Armado y desarmado de muebles',
      description: 'Desarme y armado de estaciones de trabajo modulares.',
      href: '/armado-y-desarmado-de-muebles-cusco/',
      image: '/wp-content/uploads/2024/05/SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg',
    },
    {
      title: 'Almacenaje temporal',
      description: 'Si la nueva oficina no está lista, guardamos tus equipos en depósito vigilado.',
      href: '/almacenaje-y-custodia-cusco/',
      image: '/wp-content/uploads/2024/05/MUDANZA-PERSONALIZADA-CUSCO.png',
    },
  ],

  ctaMessage:
    'Hola, necesito cotización para mudanza de oficina. Empresa: [nombre]. Estaciones de trabajo: [número]. Origen: [dirección]. Destino: [dirección]. Fecha tentativa: [fecha].',
  ctaTitle: 'Coordina tu mudanza empresarial',
  ctaSubtitle: 'Te respondemos por WhatsApp y enviamos cotización formal con cronograma.',

  schemaServiceType: 'Office Moving Service',
  areaServed: [
    'Cusco',
    'Wanchaq',
    'San Sebastián',
    'San Jerónimo',
    'Santiago',
    'Abancay',
    'Challhuahuacho',
  ],
};
