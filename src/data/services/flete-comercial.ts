import type { ServiceData } from '@lib/services';

export const fleteComercial: ServiceData = {
  slug: 'flete-comercial-cusco',
  metaTitle: 'Flete Comercial en Cusco — Servicio Recurrente | Expresos Ñan',
  metaDescription:
    'Flete comercial en Cusco para comerciantes: rutas recurrentes, descuentos por frecuencia, choferes asignados y facturación mensual. Cusco, Sicuani, Abancay. Cotiza al 925 671 052.',
  ogImage: '/wp-content/uploads/2024/05/SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg',

  hero: {
    eyebrow: 'Flete comercial',
    title: 'Flete Comercial Recurrente en Cusco',
    subtitle:
      'Servicio para comerciantes que necesitan rutas fijas: Cusco ↔ Sicuani, Cusco ↔ Abancay, entre mercados locales. Descuentos por frecuencia y facturación mensual.',
    image: '/wp-content/uploads/2024/05/SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg',
    imageAlt: 'Servicio de flete comercial recurrente en Cusco',
    whatsappMessage:
      'Hola, soy comerciante y necesito flete recurrente. Ruta: [origen-destino]. Frecuencia: [semanal/mensual]. Carga aproximada: [volumen].',
  },

  breadcrumb: 'Flete comercial',

  description: [
    'Si tu negocio mueve mercadería con regularidad — desde y hacia Sicuani, Abancay, entre mercados de Cusco, o de un almacén a tus puntos de venta — un <strong>flete comercial recurrente</strong> te sale mucho más barato y predecible que contratar flete spot cada vez.',
    'Diseñamos el servicio alrededor de tus necesidades: días fijos, choferes que conocen tus puntos de carga y descarga, facturación mensual acumulada para que lleves un solo comprobante a tu contador, y descuentos progresivos según frecuencia.',
  ],

  sections: [
    {
      title: 'Tipos de flete comercial que atendemos',
      paragraphs: [
        '<strong>Ruta Cusco ↔ Sicuani:</strong> ideal para comerciantes que abastecen tiendas en Canchis desde mayoristas cusqueños, o al revés. Frecuencia típica: 2-3 veces por semana.',
        '<strong>Ruta Cusco ↔ Abancay:</strong> similar al caso anterior hacia Apurímac. Frecuencia típica: 1-2 veces por semana.',
        '<strong>Entre mercados de Cusco:</strong> traslados entre Mercado San Pedro, Mercado Ttio, Mercado Wanchaq o puntos comerciales del Cusco metropolitano.',
        '<strong>Almacén ↔ puntos de venta:</strong> si tienes varias tiendas y un almacén central, coordinamos ruta diaria o cada cierto día.',
        '<strong>Ferias y temporadas:</strong> durante festividades (Corpus, Inti Raymi, Navidad) organizamos flete intensivo con unidades dedicadas.',
      ],
    },
  ],

  includes: [
    'Unidad dedicada en los días acordados',
    'Chofer asignado (mismo chofer siempre que sea posible)',
    'Mantas, fajas y protección estándar',
    'Personal de ayuda para carga y descarga',
    'Facturación mensual acumulada con RUC',
    'Descuento progresivo según frecuencia contratada',
  ],

  excludes: [
    'Carga peligrosa o perecedera sin refrigeración',
    'Personal fijo del cliente (no subcontratamos empleados tuyos)',
    'Almacenamiento propio de la mercadería (servicio aparte)',
  ],

  priceTable: {
    note: 'Precios referenciales con descuento por frecuencia. Para cotización exacta considera tu volumen y rutas.',
    rows: [
      {
        label: 'Flete spot (una sola vez)',
        price: 'Tarifa estándar',
        notes: 'Ver precios en página de flete',
      },
      {
        label: 'Frecuencia 1x semana (misma ruta)',
        price: '−10% sobre tarifa',
        notes: 'Acuerdo mensual',
      },
      { label: 'Frecuencia 2-3x semana', price: '−15% sobre tarifa', notes: 'Acuerdo mensual' },
      {
        label: 'Frecuencia diaria (misma ruta)',
        price: '−20% sobre tarifa',
        notes: 'Acuerdo mensual con unidad asignada',
      },
      {
        label: 'Cusco ↔ Sicuani ida y vuelta',
        price: 'S/ 500 – S/ 900',
        notes: 'Por viaje, según volumen',
      },
      { label: 'Cusco ↔ Abancay ida y vuelta', price: 'S/ 800 – S/ 1300', notes: 'Por viaje' },
    ],
  },

  gallery: [
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',
      alt: 'Unidad de 4 toneladas para flete comercial recurrente',
    },
    {
      src: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
      alt: 'Unidad de 2 toneladas para carga comercial',
    },
    {
      src: '/wp-content/uploads/2024/05/SERVICIO-DE-DESARMADO-Y-ARMADO-DE-MUEBLES-CUSCO.jpg',
      alt: 'Personal de Expreso Ñan cargando mercadería',
    },
    {
      src: '/wp-content/uploads/2024/05/MUDANZAS-DE-DEPARTAMENTO-OFICINAS-HABITACIONES-CUSCO.jpg',
      alt: 'Carga organizada para flete comercial',
    },
  ],

  faqs: [
    {
      q: '¿Cómo funciona la facturación mensual?',
      a: 'En lugar de pagar al final de cada viaje, acumulamos todos los servicios del mes y emitimos una sola factura con crédito de 15-30 días (según lo acordado). Esto simplifica tu contabilidad y te permite pagar con flujo más ordenado.',
    },
    {
      q: '¿Puedo ajustar la frecuencia mes a mes?',
      a: 'Sí, el acuerdo es flexible. Si un mes necesitas más viajes que lo contratado, agregamos extra con tarifa preferencial. Si necesitas menos, cobramos solo lo ejecutado.',
    },
    {
      q: '¿Siempre es el mismo chofer?',
      a: 'Intentamos que sí — el mismo chofer conoce tus puntos, tus clientes y cómo manejas la carga. Si tu chofer asignado tiene descanso o permiso, avisamos con anticipación y enviamos a un colega ya informado sobre tu ruta.',
    },
    {
      q: '¿Hacen flete de productos agrícolas?',
      a: 'Sí, productos no perecederos a corto plazo (granos, frutas no muy frágiles, herramientas). No movemos productos perecederos que requieran refrigeración activa ni animales vivos.',
    },
    {
      q: '¿Hay contrato mínimo?',
      a: 'No exigimos contrato legal, solo un acuerdo de palabra + WhatsApp por cada mes. Si quieres formalizar por escrito, lo hacemos sin problema.',
    },
  ],

  related: [
    {
      title: 'Flete y carga puntual',
      description: 'Si tu necesidad es de una vez, este es el servicio correcto.',
      href: '/servicio-de-flete-cusco/',
      image: '/wp-content/uploads/2024/05/MUDANZAS-CUSCO.png',
    },
    {
      title: 'Ruta Cusco ↔ Sicuani',
      description: 'La ruta comercial más frecuente de Cusco.',
      href: '/mudanzas-cusco-sicuani/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-DOS-TONELADAS-MUDANZAS-CUSCO.jpg',
    },
    {
      title: 'Ruta Cusco ↔ Abancay',
      description: 'Ruta hacia la capital de Apurímac.',
      href: '/mudanzas-cusco-abancay/',
      image: '/wp-content/uploads/2024/05/CAMION-DE-MUDANZAS-DE-5-TONELADAS-CUSCO.jpg',
    },
  ],

  ctaMessage:
    'Hola, soy comerciante y necesito flete recurrente. Ruta: [origen-destino]. Frecuencia: [semanal/mensual]. Volumen aproximado: [detalle]. ¿Cotizan plan mensual?',
  ctaTitle: 'Convierte tu flete en algo predecible',
  ctaSubtitle: 'Cuéntanos tu ruta y frecuencia, y te armamos un plan con descuento.',

  schemaServiceType: 'Commercial Freight Service',
  areaServed: ['Cusco', 'Sicuani', 'Abancay', 'Challhuahuacho'],
};
