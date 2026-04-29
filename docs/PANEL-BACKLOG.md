# Panel Interno — Backlog Completo de Funcionalidades

> Complemento de [PANEL-INTERNO.md](PANEL-INTERNO.md). Documento vivo: aquí se
> listan **todas** las funcionalidades imaginadas para el panel, priorizadas y
> estimadas, para que el propietario decida qué entra al MVP y qué se pospone.
>
> **Leyenda de prioridad:**
>
> - **P0** — YA está en PANEL-01/02/03 (core MVP)
> - **P1** — Alto ROI, recomendado incluir en MVP **si el tiempo alcanza**
> - **P2** — Útil pero no bloqueante; ideal para PANEL-04 (fase 2)
> - **P3** — Nice-to-have o proyecto largo (fase 3, post-lanzamiento estable)
>
> **Esfuerzo:** `S` (< 1 día) · `M` (1-3 días) · `L` (3-7 días) · `XL` (> 1 semana)
>
> **DB:** ✅ agrega/modifica tablas · ➖ solo UI/lógica · 🔐 afecta auth/roles

## 1. Conductor en campo (operaciones diarias)

| #    | Funcionalidad                                                                                                           | Prioridad | Esfuerzo | DB   | Racional                                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | --------- | -------- | ---- | ---------------------------------------------------------------------------- |
| 1.1  | Registro diario de ingresos/gastos con foto                                                                             | P0        | L        | ✅   | MVP                                                                          |
| 1.2  | Cierre automático 12:00 Lima día siguiente                                                                              | P0        | M        | ➖   | MVP                                                                          |
| 1.3  | Foto obligatoria según categoría + umbral                                                                               | P0        | S        | ➖   | MVP                                                                          |
| 1.4  | **Pre-trip checklist** (llantas, luces, SOAT vigente, mantas, correas) con evidencia fotográfica antes de iniciar turno | **P1**    | M        | ✅   | Previene salir con unidad no apta, reduce incidentes. Admin ve cumplimiento. |
| 1.5  | **Odómetro inicial/final del día** → km recorridos automáticos                                                          | **P1**    | S        | ✅   | Base para auditar combustible y planear mantenimiento por km                 |
| 1.6  | **Múltiples viajes por día** con hora inicio/fin por viaje (no solo ítems sueltos)                                      | **P1**    | M        | ✅   | Permite medir duración real, eficiencia de ruta                              |
| 1.7  | **Parte de incidente** (avería, accidente, queja) geo-tagged y con fotos                                                | P2        | M        | ✅   | Paper trail para reclamos a seguro y respuestas a clientes                   |
| 1.8  | **Firma digital del cliente** al iniciar y al finalizar (canvas → PNG)                                                  | P2        | M        | ✅   | Evidencia de entrega conforme. Reduce disputas.                              |
| 1.9  | **Inventario fotográfico de carga** antes de cargar el camión                                                           | P2        | S        | ➖   | Reduce disputas por daños. Reutiliza el uploader existente.                  |
| 1.10 | **Hoja de ruta digital** auto-generada por job: datos del cliente, dirección, hora de cita, instrucciones especiales    | P2        | M        | ➖   | Info a la mano; reemplaza impresiones en papel                               |
| 1.11 | **GPS en vivo opcional** durante trabajo activo                                                                         | P3        | L        | ✅🔐 | Permite al admin saber dónde va el camión. Requiere opt-in legal.            |
| 1.12 | **Clock in / out** + cálculo de horas extras                                                                            | P3        | M        | ✅   | Cumplimiento laboral; plano inclinado hacia payroll                          |
| 1.13 | **Waypoints** (paradas intermedias Urcos, Combapata) con hora y motivo                                                  | P3        | S        | ✅   | Útil solo si se hace análisis fino de rutas largas                           |
| 1.14 | **Reimpresión de registro** previo ya cerrado (solo lectura, exporta PDF)                                               | P2        | S        | ➖   | Auditorías, disputas, contador                                               |

## 2. Cotizaciones y ventas

| #    | Funcionalidad                                                                                   | Prioridad | Esfuerzo | DB  | Racional                                                      |
| ---- | ----------------------------------------------------------------------------------------------- | --------- | -------- | --- | ------------------------------------------------------------- |
| 2.1  | Crear cotización con calculadora opcional                                                       | P0        | L        | ✅  | MVP                                                           |
| 2.2  | Cotización → Job → Recibo                                                                       | P0        | L        | ✅  | MVP                                                           |
| 2.3  | Verificador público `/verificar/[uuid]` con QR                                                  | P0        | M        | ✅  | MVP                                                           |
| 2.4  | **Plantillas de servicios frecuentes** ("Depto 2 amb Wanchaq → San Jerónimo") para 1-click      | **P1**    | M        | ✅  | Cotizador emite 10× más rápido                                |
| 2.5  | **Fuente del lead** (WhatsApp, Google, referido, walk-in, cliente recurrente)                   | **P1**    | S        | ✅  | Mide qué canales convierten; guía presupuesto marketing       |
| 2.6  | **Razón de rechazo** al marcar quote como rejected                                              | **P1**    | S        | ✅  | Aprende por qué se pierden ventas (precio, fecha, competidor) |
| 2.7  | **Expiración automática** de cotización (15 días)                                               | **P1**    | S        | ✅  | Claridad con el cliente, disciplina interna                   |
| 2.8  | **Follow-up automático**: si quote `sent` > 3 días → notifica cotizador                         | P2        | M        | ✅  | Aumenta tasa de cierre                                        |
| 2.9  | **Cotización para firma online del cliente** (link público, cliente acepta, auto-cambia estado) | P2        | L        | ✅  | Cierra ventas sin re-contacto manual                          |
| 2.10 | **Vista calendario de jobs** por unidad/semana, drag-drop para reasignar                        | P2        | L        | ➖  | Vista operativa del planner                                   |
| 2.11 | **Detección de conflictos**: dos jobs solapan en la misma unidad                                | P2        | S        | ➖  | Evita doble-booking                                           |
| 2.12 | **Bulk quotes** para cuentas corporativas (Las Bambas, mudanzas múltiples)                      | P3        | M        | ➖  | Nice para empresas mineras                                    |
| 2.13 | **Precio sugerido por IA/histórico**: "moves similares cerraron a S/ X"                         | P3        | XL       | ➖  | Requiere data histórica madura                                |

## 3. Financiero y contable

| #    | Funcionalidad                                                                                                                              | Prioridad | Esfuerzo | DB   | Racional                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------- | -------- | ---- | -------------------------------------------------------------------------------------------------------------- |
| 3.1  | Balance por unidad/conductor/periodo                                                                                                       | P0        | L        | ✅   | MVP                                                                                                            |
| 3.2  | Export CSV                                                                                                                                 | P0        | S        | ➖   | MVP                                                                                                            |
| 3.3  | **P&L por job** (ingreso del job menos gastos imputables)                                                                                  | **P1**    | M        | ✅   | Saber qué jobs realmente dejan margen                                                                          |
| 3.4  | **Adelanto a conductor reconciliado con trip** (S/ 100 de combustible antes del viaje → se cierra cuando el conductor sube el recibo real) | **P1**    | M        | ✅   | Evita "perdí la plata" sin soporte                                                                             |
| 3.5  | **Caja chica** centralizada (entradas/salidas)                                                                                             | **P1**    | M        | ✅   | Control de efectivo; evita descuadres                                                                          |
| 3.6  | **Etiqueta "requiere factura SUNAT"** al emitir recibo                                                                                     | **P1**    | S        | ✅   | El contador sabe qué incluir en la declaración mensual                                                         |
| 3.7  | **Comisiones de cotizadores** (% por job cerrado)                                                                                          | P2        | M        | ✅   | Incentivo de ventas; payroll cotizador                                                                         |
| 3.8  | **Compensación de conductores** (sueldo base + comisión por trip)                                                                          | P2        | M        | ✅   | Payroll conductor                                                                                              |
| 3.9  | **Workflow de aprobación** para gastos > umbral                                                                                            | P2        | M        | ✅🔐 | Control anti-abuso; admin aprueba antes de contar el gasto                                                     |
| 3.10 | **Cuentas por cobrar** con aging (30/60/90 días) para clientes post-pago                                                                   | P2        | M        | ✅   | Empresas corporativas no pagan al momento                                                                      |
| 3.11 | **Límite de crédito** por cliente corporativo recurrente                                                                                   | P2        | S        | ✅   | Evita acumular deuda incobrable                                                                                |
| 3.12 | **Flujo de caja proyectado** (jobs agendados × tarifa)                                                                                     | P2        | M        | ➖   | Planeación financiera                                                                                          |
| 3.13 | **Estado de resultados mensual** (PDF para contador)                                                                                       | P2        | M        | ➖   | Exporta ya formateado                                                                                          |
| 3.14 | **Factura electrónica SUNAT** vía Nubefact o Efact                                                                                         | P3        | XL       | ✅🔐 | Sub-proyecto: requiere contrato con PSE (proveedor de servicios electrónicos), RUC activo, certificado digital |
| 3.15 | **Conciliación bancaria automática** (BCP/BBVA CSV)                                                                                        | P3        | XL       | ✅   | Útil solo con alto volumen de transferencias                                                                   |

## 4. Flota y mantenimiento

| #   | Funcionalidad                                                                                        | Prioridad | Esfuerzo | DB   | Racional                                                         |
| --- | ---------------------------------------------------------------------------------------------------- | --------- | -------- | ---- | ---------------------------------------------------------------- |
| 4.1 | Mantenimiento con alertas SOAT/RTV                                                                   | P0        | M        | ✅   | MVP (PANEL-03)                                                   |
| 4.2 | **Document vault por unidad** (SOAT PDF, RTV PDF, tarjeta de propiedad) accesible en ruta            | **P1**    | M        | ✅   | Conductor muestra papeles desde el celular ante control policial |
| 4.3 | **Document vault por conductor** (licencia, DNI, récord policial, médico, contrato) con vencimientos | **P1**    | M        | ✅🔐 | Compliance RRHH; licencia vencida = no manejar                   |
| 4.4 | **Eficiencia de combustible por unidad** (S/ combustible / km recorrido) con tendencia               | P2        | M        | ✅   | Detecta fugas, rutas ineficientes, robo de combustible           |
| 4.5 | **Utilización %** por unidad (días activos / días del mes)                                           | P2        | S        | ➖   | Identifica unidades subutilizadas para decidir venta o promoción |
| 4.6 | **Historial de accidentes** por unidad                                                               | P2        | S        | ✅   | Requerido si una unidad se va a vender o asegurar                |
| 4.7 | **Valor contable estimado** (precio compra − depreciación por km/años)                               | P3        | M        | ✅   | Para planear reemplazo                                           |
| 4.8 | **Calendario de rotación de llantas** por unidad                                                     | P3        | S        | ✅   | Mantenimiento preventivo                                         |
| 4.9 | **Integración con dashcam / telemetría**                                                             | P3        | XL       | ✅   | Fase avanzada; hardware involucrado                              |

## 5. CRM y clientes

| #    | Funcionalidad                                                                          | Prioridad | Esfuerzo | DB   | Racional                                                             |
| ---- | -------------------------------------------------------------------------------------- | --------- | -------- | ---- | -------------------------------------------------------------------- |
| 5.1  | CRUD de clientes básico                                                                | P0        | S        | ✅   | MVP (PANEL-02)                                                       |
| 5.2  | **Etiquetas/segmentación** (familia, estudiante, corporate, expat, Las Bambas)         | **P1**    | S        | ✅   | Aligna con personas del DRU; segmentación para marketing y analytics |
| 5.3  | **Historial de interacciones** (quotes anteriores, jobs realizados, notas de contacto) | **P1**    | M        | ✅   | Cotizador ve de inmediato si es cliente recurrente                   |
| 5.4  | **Descuento automático a cliente recurrente** (2do+ job)                               | **P1**    | S        | ➖   | Fidelización sin pensarlo                                            |
| 5.5  | **Solicitud automática de reseña** por WhatsApp 3 días post-job                        | **P1**    | M        | ➖   | Reviews Google boost; requiere Meta Cloud API o Telegram             |
| 5.6  | **Programa de referidos** (cliente trae cliente → % off próximo move)                  | P2        | M        | ✅   | Crecimiento orgánico                                                 |
| 5.7  | **Lista negra / flag de riesgo** (no pagó, problemas)                                  | P2        | S        | ✅   | Alerta al cotizador al abrir ficha                                   |
| 5.8  | **Survey post-mudanza** con score NPS                                                  | P2        | M        | ✅   | Mide satisfacción                                                    |
| 5.9  | **Cumpleaños / aniversario del cliente** → recordatorio WhatsApp                       | P3        | S        | ➖   | Toque humano                                                         |
| 5.10 | **Customer portal passwordless** (OTP WhatsApp) para auto-servicio                     | P3        | XL       | ✅🔐 | Proyecto grande, alta fricción de diseño                             |

## 6. Compliance, seguridad operacional y incidentes

| #   | Funcionalidad                                                                                                           | Prioridad | Esfuerzo | DB  | Racional                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------- | --------- | -------- | --- | -------------------------------------------------- |
| 6.1 | Audit log de mutaciones                                                                                                 | P0        | M        | ✅  | MVP                                                |
| 6.2 | **Log centralizado de incidentes** (accidente, queja, daño) con severidad y resolución                                  | **P1**    | M        | ✅  | Continuidad del conocimiento; patrones repetitivos |
| 6.3 | **Alertas de ruta bloqueada** (paro, huaico, Las Bambas) marcadas manualmente por el que se enteró primero              | **P1**    | S        | ✅  | Evita salir hacia una vía cerrada                  |
| 6.4 | **Claim tracker de seguros** (siniestro → reclamo → payout)                                                             | P2        | M        | ✅  | Cuando hay siniestros reales                       |
| 6.5 | **Flags automáticos por comportamiento del conductor** (3 cierres tardíos, gastos sin foto repetidos, queja de cliente) | P2        | M        | ✅  | RH sin revisión manual                             |
| 6.6 | **Revisión periódica del récord del conductor** (récord MTC, papeletas acumuladas)                                      | P3        | M        | ✅  | Requiere scraping MTC o input manual               |

## 7. Analytics y BI

| #   | Funcionalidad                                                         | Prioridad | Esfuerzo | DB  | Racional                                                    |
| --- | --------------------------------------------------------------------- | --------- | -------- | --- | ----------------------------------------------------------- |
| 7.1 | Dashboard admin con KPIs del día                                      | P0        | M        | ➖  | MVP (PANEL-03)                                              |
| 7.2 | **Funnel de conversión**: leads → quotes → accepted → completed con % | **P1**    | M        | ➖  | La métrica N°1 de ventas                                    |
| 7.3 | **Ingresos por tipo de servicio / ruta / cotizador**                  | **P1**    | M        | ➖  | Guía decisiones (qué rutas promover, qué servicio no rinde) |
| 7.4 | **YoY y MoM** con comparativa visual                                  | P2        | M        | ➖  | Monitoreo del crecimiento                                   |
| 7.5 | **Reporte mensual automático PDF** enviado el día 1 del mes al admin  | P2        | M        | ➖  | Lectura asincrónica                                         |
| 7.6 | **Análisis estacional** (moves/mes en un año)                         | P2        | S        | ➖  | Planeación de capacidad (peaks Dic/Ene UNSAAC)              |
| 7.7 | **Ticket promedio** por segmento, por ruta                            | P2        | S        | ➖  | Pricing intelligence                                        |
| 7.8 | **Forecasting ML** de ingresos próximos 3 meses                       | P3        | XL       | ➖  | Solo con mucha data madura                                  |
| 7.9 | **Power BI / Metabase embebido**                                      | P3        | L        | ➖  | Alternativa a construir dashboards custom                   |

## 8. Integraciones y automatización

| #   | Funcionalidad                                               | Prioridad | Esfuerzo | DB   | Racional                                         |
| --- | ----------------------------------------------------------- | --------- | -------- | ---- | ------------------------------------------------ |
| 8.1 | Notificación WhatsApp al superadmin (cierre, recibo grande) | P2        | M        | ➖   | Ya documentado en PANEL-03 §3.10                 |
| 8.2 | **Notificaciones email** vía Resend/Brevo free tier         | **P1**    | M        | ➖   | Recordatorios, confirmaciones, reset de password |
| 8.3 | **Export iCal (.ics)** de jobs por conductor                | P2        | S        | ➖   | Conductor se suscribe desde Google Calendar      |
| 8.4 | **Webhooks outbound** al aceptar quote / emitir recibo      | P2        | M        | ✅   | Conecta con Zapier / Google Sheets del contador  |
| 8.5 | **Import Excel** de histórico (primer mes de carga)         | **P1**    | M        | ➖   | Onboarding: no empezar de cero                   |
| 8.6 | **Vistas print-friendly** (hoja de ruta, balance del día)   | **P1**    | S        | ➖   | Conductores que prefieren papel                  |
| 8.7 | **API pública** con API keys scoped                         | P3        | L        | ✅🔐 | Para integrar con app móvil nativa futura        |
| 8.8 | **Google Sheets sync** del balance diario                   | P3        | M        | ➖   | El contador prefiere Sheets                      |

## 9. UX y productividad

| #    | Funcionalidad                                                          | Prioridad | Esfuerzo | DB  | Racional                                    |
| ---- | ---------------------------------------------------------------------- | --------- | -------- | --- | ------------------------------------------- |
| 9.1  | Mobile-first para conductor                                            | P0        | M        | ➖  | MVP                                         |
| 9.2  | PWA instalable + offline queue                                         | P0        | M        | ➖  | MVP                                         |
| 9.3  | **Búsqueda global Ctrl+K** (cliente, cotización, recibo, conductor)    | **P1**    | M        | ➖  | Enorme ganancia de velocidad en uso diario  |
| 9.4  | **Atajos de teclado** para power users cotizadores                     | P2        | S        | ➖  | Cotizar más rápido                          |
| 9.5  | **Items recientes** en sidebar                                         | P2        | S        | ➖  | Volver a lo que estabas haciendo            |
| 9.6  | **Bulk actions** (seleccionar N quotes → cambiar estado en bloque)     | P2        | M        | ➖  | Ahorra clics en listados                    |
| 9.7  | **Inline editing** en tablas                                           | P2        | M        | ➖  | Editar teléfono del cliente sin abrir ficha |
| 9.8  | **Modo oscuro**                                                        | P3        | S        | ➖  | Conductores nocturnos                       |
| 9.9  | **Accesibilidad WCAG 2.1 AA** en todo el panel                         | **P1**    | M        | ➖  | Mismo estándar que el sitio público         |
| 9.10 | **Estados vacíos guiados** ("aún no tienes clientes, crea el primero") | P2        | S        | ➖  | Onboarding gentil                           |

## 10. Seguridad extendida

| #     | Funcionalidad                                                                          | Prioridad | Esfuerzo | DB   | Racional                                                        |
| ----- | -------------------------------------------------------------------------------------- | --------- | -------- | ---- | --------------------------------------------------------------- |
| 10.1  | Argon2 + rate limit + CSRF via SameSite + Audit                                        | P0        | M        | ✅🔐 | MVP                                                             |
| 10.2  | 2FA TOTP para superadmin                                                               | P2        | M        | ✅🔐 | Documentado en PANEL-03 §3.11                                   |
| 10.3  | **2FA opcional para todos los roles**                                                  | P2        | S        | ✅🔐 | Extender el flujo a cualquier user                              |
| 10.4  | **Listado de sesiones activas** con botón "revocar"                                    | **P1**    | S        | ✅🔐 | Si alguien pierde el celular, corta acceso                      |
| 10.5  | **Notificar login desde nuevo dispositivo** vía WhatsApp/email                         | P2        | M        | ➖   | Detección temprana de compromiso                                |
| 10.6  | **IP whitelist** para `superadmin` (solo desde la oficina)                             | P3        | S        | ✅🔐 | Hardening extremo; poco útil si el admin viaja                  |
| 10.7  | **Encriptación de fotos en reposo** (S3 SSE-S3 en B2)                                  | P2        | S        | ➖   | Config bucket; protege en caso de breach de B2                  |
| 10.8  | **Data deletion a petición** (GDPR-like): mascarar PII del cliente, mantener agregados | P2        | M        | ✅   | Respuesta a solicitudes legales                                 |
| 10.9  | **Retención de fotos** (archive a 2 años a storage frío)                               | P3        | M        | ➖   | Ahorro de costos B2 en largo plazo                              |
| 10.10 | **Rotación automática de passwords** temporales (expiran en 24h)                       | **P1**    | S        | ✅   | Reduce ventana de abuso si la temporal cae en manos equivocadas |

## 11. Portal del cliente (auto-servicio)

Proyecto aparte, fase 3. Todo P3.

| #    | Funcionalidad                         | Esfuerzo | Racional                            |
| ---- | ------------------------------------- | -------- | ----------------------------------- |
| 11.1 | Login passwordless (OTP WhatsApp)     | L        | Baja fricción                       |
| 11.2 | Aceptar/rechazar cotización online    | M        | Cierra ventas sin ida-vuelta humana |
| 11.3 | Ver estado del trabajo en tiempo real | M        | Cliente sabe si el camión ya salió  |
| 11.4 | Descargar recibos históricos          | S        | Trivial si hay login                |
| 11.5 | Reseña post-mudanza en portal         | S        | Captura NPS                         |
| 11.6 | Pre-book online (taxi carga Cusco)    | XL       | Flow completo de quote → pago → job |

## 12. Perú / Cusco específico

| #    | Funcionalidad                                                          | Prioridad | Esfuerzo | DB   | Racional                                          |
| ---- | ---------------------------------------------------------------------- | --------- | -------- | ---- | ------------------------------------------------- |
| 12.1 | **Campo "estado de vía" por ruta** (última verificación del conductor) | **P1**    | S        | ✅   | Las Bambas y corredor sur tienen paros constantes |
| 12.2 | **Alertas colectivas** cuando alguien reporta vía bloqueada            | **P1**    | S        | ➖   | Otros conductores ven el aviso                    |
| 12.3 | **Multi-currency SOLES/USD** con tasa de cambio del día                | P2        | M        | ✅   | Expats cotizan en USD ocasionalmente              |
| 12.4 | **Integración SUNAT (Nubefact)** para facturas electrónicas            | P3        | XL       | ✅🔐 | Sub-proyecto; contrato con PSE                    |
| 12.5 | **Campo "asociación pactada"** con Las Bambas (convenio marco)         | P3        | S        | ✅   | Si se gana el contrato corporativo                |
| 12.6 | **Integración Provías para estado de carreteras**                      | P3        | XL       | ➖   | No hay API pública; scraping frágil               |

## 13. Promoción al MVP — APROBADA (2026-04-24)

**Decisión del propietario (Q1=A):** se promueven al MVP **todos** los siguientes
items P1 además del core P0. Los 3 sprints (PANEL-01/02/03) ya reflejan el
alcance ampliado en sus tareas.

### A añadir en PANEL-01 (conductores)

- **1.4 Pre-trip checklist** (M, 2d) — reduce incidentes desde día 1
- **1.5 Odómetro inicial/final** (S, 0.5d) — base de futuras métricas
- **1.6 Múltiples viajes por día** con inicio/fin (M, 2d) — permite medir bien

### A añadir en PANEL-02 (cotizaciones)

- **2.4 Plantillas de servicios frecuentes** (M, 2d) — 10× velocidad cotizador
- **2.5 Fuente del lead** (S, 0.5d) — dato pequeño, insight enorme
- **2.6 Razón de rechazo** (S, 0.5d) — aprendizaje sobre pricing
- **2.7 Expiración automática** (S, 0.5d) — disciplina operativa
- **5.2 Etiquetas de cliente** (S, 0.5d) — trivial, mucho ROI analítico
- **5.3 Historial del cliente en su ficha** (M, 1.5d) — cotizador ve todo

### A añadir en PANEL-03 (admin)

- **3.3 P&L por job** (M, 2d) — métrica crítica de rentabilidad
- **3.5 Caja chica** (M, 2d) — control efectivo, evita descuadres
- **3.6 Etiqueta "requiere factura SUNAT"** (S, 0.5d) — el contador lo va a pedir
- **4.2 Document vault por unidad** (M, 2d) — papeles en el celular
- **4.3 Document vault por conductor** (M, 2d) — compliance RRHH
- **7.2 Funnel de conversión** (M, 1.5d) — primera métrica que va a querer ver
- **7.3 Ingresos por ruta/servicio/cotizador** (M, 1.5d) — guía comercial
- **8.2 Notificaciones email** (M, 2d) — reset de password, recordatorios
- **8.5 Import Excel** (M, 2d) — onboarding del histórico
- **8.6 Print-friendly** (S, 0.5d) — hoja de ruta en papel
- **9.3 Búsqueda global Ctrl+K** (M, 2d) — productividad diaria
- **9.9 Accesibilidad WCAG AA** (M, 2d) — mismo estándar del sitio público
- **10.4 Listado de sesiones activas** (S, 1d) — seguridad básica esperable
- **10.10 Expiración password temporal** (S, 0.5d) — hardening simple
- **12.1-12.2 Estado de vía colaborativo** (S, 1d) — crítico en corredor Las Bambas

**Total estimado con las promociones P1: ~26 días hábiles sobre los 30 ya
planeados** (6 semanas). Queda apretado pero viable. Si alguno se sale del
tiempo, se mueve a PANEL-04 (fase 2).

## 14. Lo que DEJARÍA fuera del MVP (y por qué)

Aunque tentador, recomiendo **no incluir** en el MVP:

- **2.9 Cotización para firma online del cliente** — cambia el flujo público, riesgo de alcance, fase 2.
- **2.10 Vista calendario drag-drop** — UI pesada; el listado + filtros basta.
- **3.7-3.8 Comisiones y compensación** — abre el capítulo de payroll; muy dependiente de la realidad RRHH; mejor discutir primero con contador.
- **3.14 Factura electrónica SUNAT** — sub-proyecto con contrato PSE. Cuando se active, es su propio sprint.
- **4.4 Eficiencia de combustible** — requiere que 1.5 (odómetro) acumule data varias semanas; activar post-lanzamiento.
- **5.6 Programa de referidos** — lógica promocional; mejor definir las reglas comerciales primero.
- **6.4 Claim tracker de seguros** — solo tiene sentido tras un siniestro real.
- **11.x Portal del cliente** — proyecto propio; decidir después de 3-6 meses con el panel interno vivo.
- **12.4 SUNAT** — ídem 3.14.

## 15. Decisiones tomadas (2026-04-24)

**Q1 — Promoción al MVP:** **A** → todos los P1 recomendados en §13 pasan al
MVP. Los sprints PANEL-01/02/03 fueron extendidos para cubrirlos.

**Q2 — Canal de notificaciones:** **D** → sin WhatsApp ni Telegram en el MVP.
Solo panel web + emails transaccionales. Los items 5.5, 8.1 y 10.5 quedan
diferidos a fase 2. La sección de notificaciones WhatsApp en PANEL-03 §3.10
queda marcada como "fuera de alcance MVP — ver backlog".

**Q3 — Storage B2:** **B** → dos buckets separados:

- `cuscomudanzas-panel-fotos` — fotos operativas (ingresos, gastos,
  pre-trip). Retención 2 años, luego archive a storage frío.
- `cuscomudanzas-panel-docs` — documentos legales (SOAT, RTV, licencias,
  contratos, PDFs de recibos emitidos). Versionado habilitado, retención
  indefinida.

**Servicio de email:** Gmail SMTP con Nodemailer usando la cuenta operativa
existente. Requiere App Password (2FA activado en la cuenta). Suficiente para
el volumen esperado < 50 emails/día. Ruta de migración futura a Resend
documentada.
