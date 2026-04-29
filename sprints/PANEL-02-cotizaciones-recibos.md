# PANEL-02 — Cotizaciones, Trabajos y Recibos

**Duración:** 10 días hábiles (semanas 14-15)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** PANEL-01 completado (auth + conductores).
**Documento maestro:** [docs/PANEL-INTERNO.md](../docs/PANEL-INTERNO.md)
**Alcance aprobado:** incluye 6 items P1 promovidos del backlog (§2.15-2.20):
plantillas, fuente del lead, razón de rechazo, expiración automática,
etiquetas de cliente, historial del cliente en ficha.

## Objetivo

Habilitar al rol `cotizador` (y al `superadmin` por herencia) para crear
cotizaciones de servicio, convertirlas en trabajos asignables, generar recibos
PDF numerados y publicar un verificador público.

## Entregable verificable

Un cotizador puede:

1. Crear una cotización para una mudanza de 2 ambientes con 2 personal entre
   Wanchaq y San Jerónimo
2. Usar la calculadora opcional o digitar el total a mano
3. Guardar la cotización en estado `sent`
4. Marcar la cotización como `accepted` → se crea un `job` automáticamente
5. Asignar unidad y conductor al trabajo
6. Al completar el trabajo, emitir el recibo PDF y descargarlo
7. Cualquier persona con el link `https://cuscomudanzas.com/verificar/<uuid>`
   puede verificar el recibo

## Tareas

### 2.1 — Tablas adicionales

Añadir a `src/db/schema.ts`:

- `customers`
- `quotes`
- `quote_items`
- `jobs`
- `receipts`
- `calc_config` (seed con estructura §5.4 del doc maestro)

Generar migración y aplicar.

### 2.2 — CRUD de clientes

- `/panel/cotizador/clientes/` — listado + buscador por nombre o teléfono
- `/panel/cotizador/clientes/nuevo/` — form (nombre, teléfono, email,
  DNI/RUC/CE)
- `/panel/cotizador/clientes/[id]/` — editar + historial de cotizaciones

API: `POST /api/panel/customers`, `PATCH /api/panel/customers/[id]`.

Regla: el teléfono es único por cliente. Si se intenta crear un cliente con un
teléfono ya existente, se ofrece "¿Quieres abrir la ficha del cliente X?".

### 2.3 — Calculadora de precios

`src/lib/panel/pricing.ts`:

```ts
export interface QuoteInput {
  service_type: ServiceType;
  distance_km?: number;
  volume_m3?: number;
  floors_origin?: number;
  floors_dest?: number;
  has_elevator?: boolean;
  crew_size?: number;
  date?: string; // detecta fin de semana
  is_overnight_route?: boolean;
}

export function estimate(
  input: QuoteInput,
  rules: CalcRules,
): {
  total_cents: number;
  breakdown: { label: string; amount_cents: number }[];
};
```

Lee `calc_config.rules_json` (cacheado con TTL 5 min in-memory; invalidación al
guardar cambios).

Unit tests con casos de la tabla §5.4 del doc maestro.

### 2.4 — Formulario de nueva cotización

`/panel/cotizador/nueva/`:

- Paso 1: Cliente (autocompletado por teléfono; crear nuevo inline)
- Paso 2: Servicio (select `service_type`)
- Paso 3: Detalles
  - Comunes: origen, destino, fecha tentativa
  - Flete: volumen m³, distancia km
  - Mudanza: +crew_size, pisos origen/dest, ascensor sí/no
  - Almacenaje: m³ + meses
  - Embalaje solo: ítems a embalar (descripción libre)
- Paso 4: **Calculadora opcional**
  - Toggle "Usar calculadora" (default on)
  - Si on: muestra el breakdown editable; el total se recalcula
  - Si off: campo `total_cents` manual
- Paso 5: Ítems de la cotización (desglose mostrable al cliente)
- Botón "Guardar borrador" y "Enviar al cliente" (este segundo marca `sent`)

Persiste con `POST /api/panel/quotes` / `PATCH /api/panel/quotes/[id]`.

### 2.5 — Numeración de cotizaciones y recibos

`src/lib/panel/numbering.ts`:

```ts
// Secuencial por tipo y año, atomico con transacción SQLite
export function nextQuoteNumber(): string; // "COT-2026-0001"
export function nextReceiptNumber(): string; // "REC-2026-0001"
```

Tabla auxiliar `counters (year INT, kind TEXT, value INT, PRIMARY KEY(year,kind))`.

### 2.6 — Listado y estados de cotizaciones

`/panel/cotizador/listado/`:

- Filtros: estado, fecha, cliente
- Columnas: número, cliente, servicio, total, estado, fecha
- Acciones por fila:
  - Abrir detalle
  - Marcar como `sent`
  - Marcar como `accepted` → prompt para confirmar creación de `job`
  - Marcar como `rejected` (captura razón opcional)

### 2.7 — Detalle de cotización

`/panel/cotizador/[id]/`:

- Toda la info editable mientras estado sea `draft`.
- Si ya está `sent` o `accepted`, solo estado puede cambiar.
- Log de cambios de estado embebido (de `audit_log`).
- Botón "Generar PDF" que produce un PDF de cotización (no el recibo, esta es
  la propuesta comercial — mismo builder reusado).

### 2.8 — Conversión a trabajo

Al aceptar una cotización (`status='accepted'`):

1. Crear fila `jobs` con `quote_id`, `status='scheduled'`.
2. Redirigir a `/panel/cotizador/trabajos/[job_id]/` para asignar unidad +
   conductor + fecha.
3. Registrar en `audit_log`.

`/panel/cotizador/trabajos/`:

- Listado: fecha, cotización, cliente, unidad, conductor, estado
- Filtros por estado y fecha

`/panel/cotizador/trabajos/[id]/`:

- Asignar unidad (dropdown, solo unidades activas)
- Asignar conductor (solo conductores asignados a esa unidad)
- Actualizar fecha programada
- Estados: `scheduled → in_progress → completed` (con botón)
- Al pasar a `completed`, setear `completed_at` y aparece botón "Emitir recibo"

### 2.9 — Generación del recibo PDF

`src/lib/panel/pdf-receipt.ts`:

```ts
export async function buildReceiptPdf(
  receipt: Receipt,
  customer: Customer,
  items: QuoteItem[],
): Promise<Uint8Array>;
```

Usa `pdf-lib`:

- Página A4
- Header: logo (Ñan-2.png, embebido como PNG) + datos fiscales del emisor
- Número grande centrado
- Datos del cliente
- Servicio: origen, destino, fecha, unidad, conductor
- Tabla de ítems con total
- Método de pago
- Footer: QR apuntando a `/verificar/<uuid>` + sello "Documento emitido electrónicamente"

Al emitir:

1. Generar `uuid` + `number` (REC-YYYY-XXXX)
2. Construir PDF en memoria
3. Subir al bucket `cuscomudanzas-panel-docs` bajo key `receipts/YYYY/<uuid>.pdf`
   (documentos legales, versionado activo, retención indefinida — ver
   PANEL-INTERNO.md §8)
4. Guardar `receipts.pdf_key`
5. Responder con URL firmada para descarga inmediata (1h)

`POST /api/panel/receipts/issue-from-job/[job_id]`.

### 2.10 — Anular recibo

`POST /api/panel/receipts/[id]/void` (solo `superadmin` o el emisor original):

- Setea `voided_at` y `void_reason`
- El PDF permanece en B2 pero el verificador público muestra "ANULADO"
- Registra en `audit_log`

### 2.11 — Verificador público

`src/pages/verificar/[uuid].astro` (SSR, sin auth):

- Consulta `receipts WHERE uuid = ?`
- Si no existe → 404 con mensaje "Recibo no encontrado o anulado"
- Si existe y `voided_at IS NULL` → verde "Válido", muestra número, fecha,
  total, cliente (solo nombre), servicio
- Si `voided_at IS NOT NULL` → rojo "Anulado", muestra razón
- Footer con logo y teléfono 925 671 052 por si el cliente quiere validar por
  otro canal
- **No** incluir link al PDF original desde acá (lo tiene el cliente que lo
  recibió directamente).

### 2.12 — PDF de cotización (pre-venta)

`src/lib/panel/pdf-quote.ts` — similar al de recibo pero con:

- Header "COTIZACIÓN"
- Validez: "Esta cotización es válida por 15 días desde la fecha de emisión"
- Sin QR de verificación (solo recibos emitidos lo llevan)
- Sin método de pago

### 2.13 — Listado de recibos emitidos

`/panel/cotizador/recibos/`:

- Columnas: número, cliente, total, método pago, fecha, estado (válido/anulado)
- Descargar PDF, ver verificador, anular
- Filtros por fecha y estado

### 2.14 — Integración con el módulo de conductores

Cuando un `job` queda en estado `in_progress`, si el conductor asignado abre
`/panel/conductor/hoy/`, el job aparece en la pestaña "Mis trabajos del día"
como recordatorio informativo (no edita nada aquí, solo referencia).

Los ingresos del conductor (tabla `entry_items`) NO se vinculan
automáticamente al `job`: el conductor sigue ingresando montos a mano. Vincular
ambos flujos queda como funcionalidad opcional fase 2 (reconciliación).

### 2.15 — Plantillas de servicios frecuentes (P1 item 2.4)

Tabla `quote_templates` definida en PANEL-INTERNO.md §4.4.

1. Ruta `/panel/cotizador/plantillas/` — listado con buscador.
2. `/panel/cotizador/plantillas/nueva/` — form para crear plantilla:
   - Nombre ("Depto 2 amb Wanchaq → San Jerónimo")
   - Tipo de servicio
   - Valores default: volumen m³, distancia km, pisos, crew_size, ascensor
   - Ítems default (array de `{label, amount_cents}`)
3. En `/panel/cotizador/nueva/` el paso inicial ofrece:
   - Botón "Usar plantilla" → abre selector de `quote_templates`
   - Al elegir, pre-llena todos los campos y los ítems. El cotizador ajusta
     si hace falta.
   - Persiste `quote.template_id` para estadística.
4. API: `POST /api/panel/quote-templates`, `PATCH`, `DELETE` (soft).

### 2.16 — Fuente del lead (P1 item 2.5)

Campo `lead_source` ya añadido a `quotes` (PANEL-INTERNO.md §4.4).

1. En el formulario de nueva cotización, paso 1 (Cliente), añadir:
   - Select obligatorio "¿Cómo nos conoció?": WhatsApp / Google / Referido /
     Walk-in / Cliente recurrente / Otro
2. Si el customer ya existe con jobs previos, pre-seleccionar "Cliente
   recurrente" pero editable.
3. Reporte en PANEL-03 agrupa `quotes GROUP BY lead_source` (ver §7.3 del
   backlog y PANEL-03 §3.30).

### 2.17 — Razón de rechazo (P1 item 2.6)

Campo `rejection_reason` + `rejection_note` ya añadidos a `quotes`.

1. Al marcar quote como `rejected`, abrir modal obligatorio:
   - Radio "¿Por qué se perdió?": Precio / Fecha / Competidor /
     Sin respuesta / Otro
   - Textarea opcional "Comentario"
2. `POST /api/panel/quotes/[id]/reject` acepta `{ reason, note }` y valida
   con Zod. Si `reason='otro'`, `note` obligatoria.
3. Reporte en PANEL-03 §3.31: distribución de razones de pérdida.

### 2.18 — Expiración automática de cotizaciones (P1 item 2.7)

Campo `expires_at` ya añadido a `quotes`.

1. Cuando una cotización pasa a `sent`, si `expires_at IS NULL`, setear
   automáticamente a `now() + 15 días` (configurable por admin en PANEL-03).
2. Cron diario adicional a las 06:00 Lima:
   - `UPDATE quotes SET status='expired' WHERE status='sent' AND expires_at < now()`
   - Loguea en audit_log
3. UI: en el listado y detalle mostrar badge "Vence en X días" / "Vencida".
4. El verificador público `/verificar/[uuid]` y el PDF de cotización muestran
   la fecha de expiración.
5. Permitir "Extender expiración" desde el detalle (solo mientras esté en
   `sent` o `expired`; reabre con nueva fecha).

### 2.19 — Etiquetas de cliente (P1 item 5.2)

Campo `customers.tags_json` ya añadido.

1. Catálogo sugerido (editable en PANEL-03): `familia`, `estudiante`,
   `empresa`, `expat`, `las-bambas`, `corporate-recurrente`, `vip`.
2. En la ficha del cliente, componente multi-select tipo chip (añade/quita).
3. Filtro por etiqueta en `/panel/cotizador/clientes/`.
4. Reportes en PANEL-03 segmentan por etiqueta (segmentación de personas del
   DRU).

### 2.20 — Historial completo en ficha del cliente (P1 item 5.3)

En `/panel/cotizador/clientes/[id]/` añadir 3 pestañas:

1. **Datos** — edición de campos + etiquetas + notas + flag blacklist.
2. **Cotizaciones** — todas las quotes del cliente, ordenadas desc. por fecha,
   con estado y total. Click abre cotización.
3. **Trabajos y recibos** — jobs completados con sus receipts, total gastado
   acumulado. Indicador "Cliente recurrente desde YYYY-MM-DD" si hay ≥ 2
   completados.

Banner superior si:

- `blacklisted=1` → rojo con motivo
- `≥ 2 jobs completados y último hace < 12 meses` → verde "Cliente fiel,
  considera descuento"

## Criterios de aceptación

- [ ] Cliente nuevo puede crearse y reutilizarse en cotizaciones sucesivas
- [ ] Calculadora refleja cambios al modificar volumen/distancia/pisos
- [ ] Cotización se puede guardar, enviar, aceptar y rechazar; estados se
      respetan con middleware
- [ ] Aceptar una cotización crea el `job` automáticamente
- [ ] PDF de recibo se descarga, tiene número secuencial único y QR funcional
- [ ] `/verificar/[uuid]` muestra el estado correcto sin login
- [ ] Anular un recibo actualiza el verificador en < 5 s
- [ ] Numeración secuencial nunca se repite (probado con 100 emisiones
      concurrentes en test)
- [ ] Cotizador no puede editar recibos emitidos por otros cotizadores (solo
      superadmin)
- [ ] ESLint + TypeScript limpios
- [ ] Cobertura de `lib/panel/pricing.ts` ≥ 80%
- [ ] **Plantilla** pre-llena todos los campos al crear cotización (P1)
- [ ] **Fuente del lead** es obligatoria y visible en reportes (P1)
- [ ] **Razón de rechazo** se captura con modal al marcar rejected (P1)
- [ ] **Expiración automática** mueve quote a `expired` el día 16 sin
      intervención (P1)
- [ ] **Etiquetas** se pueden añadir/quitar y filtrar en el listado (P1)
- [ ] Ficha del cliente muestra historial completo con banner de fidelidad (P1)

## Siguiente sprint

**[PANEL-03 — SuperAdmin y Reportes](PANEL-03-admin-reportes.md)**
