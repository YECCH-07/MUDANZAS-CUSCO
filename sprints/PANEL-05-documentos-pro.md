# PANEL-05 — Documentos profesionales (PDFs avanzados)

> **Objetivo:** llevar las cotizaciones y recibos a un nivel "agencia
> profesional": multipágina, condiciones legales completas, watermark, firma
> digital, multi-idioma y galería visual.
> **Cuándo:** después de PANEL-04 (rediseño UI). Antes de cerrar contratos
> empresariales grandes (Carlos persona del DRU).

## Tareas

### 5.1 — Catálogo de servicios editable desde admin

- [ ] CRUD `/panel/admin/servicios/` (tabla `service_catalog`):
  - id (slug)
  - nombre comercial
  - tagline
  - descripción larga (rich text con MDX)
  - imagen de portada (B2 docs)
  - galería de fotos (relación 1:N)
  - precio base (cents) — opcional
  - condiciones específicas (rich text)
  - activo / archivado
- [ ] Migrar el `src/lib/panel/services.ts` actual a esta tabla. Seed inicial
      con los servicios actuales.
- [ ] Pre-fill de la cotización a partir de un servicio del catálogo.

### 5.2 — Cotizaciones multipágina

- [ ] Página 1: portada con logo grande, número de cotización, datos del
      cliente, mensaje personalizado, foto principal del servicio.
- [ ] Página 2: detalle del servicio (lo que ya tenemos).
- [ ] Página 3: galería de fotos del tipo de servicio (3-4 fotos relevantes).
- [ ] Página 4: condiciones generales (texto legal estándar) + condiciones
      específicas del servicio.
- [ ] Página 5: firma digital del cotizador (imagen escaneada o canvas) +
      espacio para aceptación del cliente.
- [ ] Watermark "BORRADOR" sutil cuando status='draft'.
- [ ] Watermark "ACEPTADA" verde cuando status='accepted'.
- [ ] Watermark "RECHAZADA" rojo cuando status='rejected'.
- [ ] Watermark "VENCIDA" gris cuando expirada.

### 5.3 — Recibos profesionales

- [ ] Banda de "Documento original / Copia" según download (auditable).
- [ ] Espacio para firma del cliente (en PDF descargable como hoja).
- [ ] Versión para imprimir 2-up (dos recibos por página A4).
- [ ] Versión 80mm para impresora térmica (ESC/POS o PDF estrecho).
- [ ] Hash SHA-256 visible bajo el QR para auditoría.

### 5.4 — Multi-idioma

- [ ] Toggle ES/EN al descargar.
- [ ] Traducir descripciones de servicios.
- [ ] Útil para clientes Sarah (expat) y empresas internacionales.

### 5.5 — Email automático

- [ ] Al marcar "send", enviar email con PDF adjunto al cliente.
- [ ] Plantilla HTML con branding (logo + color carmesí).
- [ ] Tracking pixel para saber si abrió el email.
- [ ] Botones "Aceptar" / "Rechazar" en el email (tokens firmados).

### 5.6 — Firma electrónica del cliente (sin SUNAT)

- [ ] Link público `/cotizacion/[token]/` con preview del PDF.
- [ ] Botón "Aceptar y firmar" con canvas de firma.
- [ ] Al firmar: cambia status a accepted, genera PDF v2 con firma incorporada,
      envía email de confirmación al cotizador.

### 5.7 — Galería de fotos por servicio realizado

- [ ] Conductor sube fotos durante el servicio (antes/durante/después).
- [ ] Galería privada accesible solo al cliente con su token.
- [ ] Anexo opcional al recibo: "Galería del servicio (12 fotos)".
- [ ] Archivo zip descargable con todas las fotos.

## Definición de hecho

- Cotización emitida con plantilla profesional pasa revisión visual con cliente
  empresarial (test con Carlos persona).
- Cliente acepta cotización 100% online sin que el cotizador lo llame.
- Tasa de conversión draft→accepted sube ≥ 15% vs. cotizaciones actuales.
