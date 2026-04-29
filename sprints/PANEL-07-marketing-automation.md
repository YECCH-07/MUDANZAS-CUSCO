# PANEL-07 — Marketing automation y CRM ligero

> **Objetivo:** convertir el panel en un CRM operativo: campañas, segmentación,
> automatizaciones y métricas de funnel. Que el equipo deje de hacer follow-up
> manual.
> **Cuándo:** después de PANEL-06. Cuando el portal cliente esté generando
> volumen de leads que pasan al funnel.

## Tareas

### 7.1 — Segmentación de clientes

- [ ] Tabla `customer_segments` con reglas dinámicas:
  - "Cotizó pero no aceptó (>15 días)"
  - "Recurrentes (>= 3 servicios completed)"
  - "Empresariales (RUC válido)"
  - "Estudiantes UNSAAC (lead_source = 'unsaac')"
  - "Inactivos (>365 días sin contacto)"
- [ ] Vista en `/panel/admin/segmentos/` con conteo de clientes por segmento.

### 7.2 — Campañas de email/WhatsApp

- [ ] Editor de plantilla con merge tags (`{{nombre}}`, `{{ultima_ruta}}`).
- [ ] Schedule de envío masivo con throttle (Gmail SMTP: 100/día; WhatsApp
      Business API: ilimitado pero con rate limit).
- [ ] Tracking: enviado, abierto (pixel), click en link, respondido.

### 7.3 — Automatizaciones (triggers)

- [ ] "Cotización sin respuesta 3 días" → email recordatorio + WhatsApp.
- [ ] "Cotización sin respuesta 7 días" → mover a 'expired' + email cierre.
- [ ] "Servicio completado" → email/SMS pidiendo reseña + factura.
- [ ] "Cliente cumpleaños" → mensaje con código de descuento.
- [ ] "Aniversario de mudanza" (1 año) → "¿Necesitas otra? Aquí estamos".

### 7.4 — Funnel y atribución

- [ ] Mejorar el funnel actual con:
  - Conversion rate por canal (whatsapp, google, referido, walk-in)
  - Tiempo medio entre etapas
  - Costo de adquisición por cliente (si se mete CAC manual)
  - LTV por persona (María, Carlos, Diego, Rosa, Sarah)
- [ ] Cohort analysis: "¿Qué % de clientes de enero compraron de nuevo en
      abril?"

### 7.5 — Lead scoring

- [ ] Asignar puntos a cada cliente según comportamiento:
  - +20 si descargó PDF
  - +30 si abrió email
  - +50 si hizo click en link de pago
  - -10 por cada día sin respuesta
- [ ] Cotizadores ven leads ordenados por score (los más calientes primero).

### 7.6 — Dashboard ejecutivo

- [ ] Vista para Yeison (superadmin) con:
  - Ingresos mes actual vs mes anterior (sparkline)
  - Servicios completados por unidad (top 3)
  - Conductor más productivo del mes
  - Cotizador con mejor conversión
  - Pronóstico de cierre del mes (basado en cotizaciones sent)

### 7.7 — Importación masiva

- [ ] Import desde Excel del histórico anterior (ya existe tabla
      `import_jobs`, falta UI).
- [ ] Import de contactos desde Google Contacts.
- [ ] Sincronización con Facebook Lead Ads.

## Definición de hecho

- Reducir 50% el tiempo del cotizador en follow-up manual.
- Recuperar al menos 5 cotizaciones expiradas por mes con automatizaciones.
- LTV por persona claramente medible y por encima del CAC.
