/*
 * Catálogo de servicios de Expresos Ñan.
 *
 * Los `id` coinciden con el enum `quotes.service_type` en la BD para no romper
 * cotizaciones existentes. Agregamos `name`, `tagline` y `description` para
 * presentación uniforme en UI y PDFs.
 */

export type ServiceId =
  | 'mudanza_embalaje'
  | 'mudanza_personal'
  | 'solo_vehiculo_personal'
  | 'flete'
  | 'embalaje_solo'
  | 'armado_desarmado'
  | 'almacenaje'
  | 'otro';

export interface ServiceCatalogEntry {
  id: ServiceId;
  /** Nombre comercial corto para selects y badges. */
  name: string;
  /** Subtítulo de una línea para la cotización. */
  tagline: string;
  /** Descripción larga (2-4 líneas) que se imprime en PDFs y en el detalle. */
  description: string;
  /** ¿Es un servicio "principal" de mudanza? Los principales aparecen primero. */
  primary: boolean;
}

export const SERVICE_CATALOG: ServiceCatalogEntry[] = [
  {
    id: 'mudanza_embalaje',
    name: 'Mudanza Express',
    tagline: 'Servicio puerta a puerta integral, sin que te preocupes por nada.',
    description:
      'Nos encargamos de todo: embalaje profesional con materiales propios, carga, transporte ' +
      'seguro, descarga y desempaque en el destino. Incluye personal capacitado, vehículo ' +
      'apropiado al volumen y protección de muebles delicados. Ideal para familias y empresas ' +
      'que valoran su tiempo.',
    primary: true,
  },
  {
    id: 'mudanza_personal',
    name: 'Mudanza Estándar',
    tagline: 'Mudanza con vehículo y personal de carga, tú haces tu propio embalaje.',
    description:
      'Incluye vehículo apropiado, personal de carga y descarga capacitado, transporte directo ' +
      'al destino y armado/desarmado básico de muebles. El embalaje y desempaque corren por tu ' +
      'cuenta; podemos asesorarte en materiales si lo necesitas. Opción más económica para ' +
      'mudanzas locales y al Valle Sagrado.',
    primary: true,
  },
  {
    id: 'solo_vehiculo_personal',
    name: 'Vehículo + Personal de carga y descarga',
    tagline: 'Solo el camión y la cuadrilla; tú coordinas el resto.',
    description:
      'Asignamos el vehículo del tonelaje que necesitas y un equipo de carga y descarga por ' +
      'horas. Tú decides ruta, paradas y embalaje. Útil para fletes específicos, traslado de ' +
      'mercadería comercial, recojo de muebles nuevos o cualquier servicio donde solo necesites ' +
      'músculo y vehículo.',
    primary: true,
  },
  {
    id: 'flete',
    name: 'Flete',
    tagline: 'Transporte de carga punto a punto, sin personal extra.',
    description:
      'Servicio de flete con conductor para traslado directo de carga. Capacidad según unidad ' +
      'asignada (1, 2 o 4 toneladas). El cliente coordina la carga y descarga.',
    primary: false,
  },
  {
    id: 'embalaje_solo',
    name: 'Embalaje profesional',
    tagline: 'Equipo experto que embala tu casa o oficina, sin transporte.',
    description:
      'Servicio de embalaje a domicilio con materiales profesionales (cajas reforzadas, papel ' +
      'burbuja, mantas, esquineros). Ideal cuando ya tienes el transporte resuelto pero ' +
      'quieres asegurar que todo viaje protegido.',
    primary: false,
  },
  {
    id: 'armado_desarmado',
    name: 'Armado y desarmado de muebles',
    tagline: 'Técnicos para desarmar antes de mudar y armar al llegar.',
    description:
      'Personal especializado para desarmar muebles modulares, camas, escritorios y armarios ' +
      'antes del traslado, y rearmarlos en el nuevo lugar. Incluye herramientas y resguardo ' +
      'de tornillería.',
    primary: false,
  },
  {
    id: 'almacenaje',
    name: 'Almacenaje y custodia',
    tagline: 'Guardamos tus pertenencias por días, meses o años.',
    description:
      'Almacén seguro y limpio para guardar muebles, cajas, archivos o mercadería. Tarifas ' +
      'mensuales fijas según volumen. Acceso programado y entrega coordinada cuando lo ' +
      'necesites. Servicio diferenciador de Expresos Ñan en Cusco.',
    primary: false,
  },
  {
    id: 'otro',
    name: 'Servicio personalizado',
    tagline: 'Coordinamos un servicio a medida según tus necesidades.',
    description:
      'Servicio especial fuera del catálogo estándar (eventos, traslados nocturnos, cargas ' +
      'frágiles, distancias largas). Se cotiza caso por caso.',
    primary: false,
  },
];

const BY_ID = new Map(SERVICE_CATALOG.map((s) => [s.id, s]));

export function getService(id: string): ServiceCatalogEntry {
  return (
    BY_ID.get(id as ServiceId) ?? {
      id: 'otro' as ServiceId,
      name: id,
      tagline: '',
      description: '',
      primary: false,
    }
  );
}

export function serviceLabel(id: string): string {
  return getService(id).name;
}
