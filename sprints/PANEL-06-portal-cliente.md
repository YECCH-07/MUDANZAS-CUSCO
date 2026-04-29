# PANEL-06 — Portal cliente self-service

> **Objetivo:** dar al cliente final una experiencia digital completa: ver sus
> cotizaciones, aceptarlas, hacer seguimiento del servicio y descargar
> documentos sin tener que llamar a la oficina.
> **Cuándo:** después de PANEL-05 (documentos pro). Habilita escalar
> operaciones sin contratar más cotizadores.

## Tareas

### 6.1 — Acceso por link mágico (sin password)

- [ ] Cuando el cotizador marca "send", se genera token `customer_session`
      (JWT con expiración 30 días) y se envía por WhatsApp/email:
      `cuscomudanzas.com/mi-cuenta/[token]/`.
- [ ] Token único por cliente (no por cotización), permite ver su historial
      completo.
- [ ] Renovar acceso desde el panel admin con un click.

### 6.2 — Portal `/mi-cuenta/`

- [ ] Dashboard del cliente con:
  - Cotizaciones activas (sent, sin respuesta)
  - Cotizaciones aceptadas con fecha programada
  - Trabajos en curso (el conductor las marca)
  - Historial completo
- [ ] Detalle de cotización con:
  - Vista del PDF inline (iframe + viewer.js)
  - Botones "Aceptar" / "Rechazar" / "Pedir cambios"
  - Chat asíncrono con el cotizador (mensajes guardados en BD).

### 6.3 — Tracking en vivo del servicio

- [ ] Página `/mi-cuenta/trabajo/[id]/` con:
  - Foto de la unidad asignada
  - Foto del conductor
  - Estado actual (programado / en camino / cargando / en ruta / descargando / completado)
  - Mapa con ubicación aproximada del camión (cuando el conductor habilita
    geolocalización en su PWA, opcional)
  - Galería de fotos en tiempo real subidas por el conductor

### 6.4 — Recolección de información previa

- [ ] Formulario "Cuéntanos qué tienes" con:
  - Subir fotos del lugar origen (sala, dormitorios, cocina, baños)
  - Subir fotos del destino
  - Lista de items frágiles
  - Horario preferido
- [ ] Auto-cálculo de volumen estimado por análisis de las fotos (manual
      por ahora; en el futuro, ML).

### 6.5 — Pago online

- [ ] Integración con Culqi o Niubiz para tomar adelanto del 30%.
- [ ] QR de Yape/Plin con monto pre-llenado.
- [ ] Recibo automático al confirmar pago.

### 6.6 — Reseñas post-servicio

- [ ] Email/SMS automático 24h después de completed: "¿Cómo estuvo tu mudanza?"
- [ ] Formulario corto: estrellas, comentario, fotos opcionales.
- [ ] Reseñas positivas con permiso → publicar en sitio público con foto.
- [ ] Reseñas negativas → escalar al admin.

### 6.7 — Programa de referidos

- [ ] "Recomienda y gana": link único por cliente.
- [ ] Si su referido contrata, ambos reciben S/ 50 de descuento en su próximo
      servicio.
- [ ] Tracking en BD (tabla `referrals`).

## Definición de hecho

- Cliente puede contratar un servicio entero sin hablar con nadie del equipo.
- 30% de cotizaciones se cierran por el portal en lugar de llamada.
- Tasa de reseña post-servicio ≥ 40%.
