# PANEL-03 — SuperAdmin y Reportes

**Duración:** 10 días hábiles (semanas 16-17)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** PANEL-01 y PANEL-02 completados.
**Documento maestro:** [docs/PANEL-INTERNO.md](../docs/PANEL-INTERNO.md)
**Alcance aprobado:** incluye ~14 items P1 promovidos del backlog (§3.14-3.27):
P&L por job, caja chica, tag SUNAT, document vaults, funnel de conversión,
ingresos por ruta/servicio, emails Nodemailer, import Excel, printables,
Ctrl+K search, WCAG AA, sesiones activas, expiración password temporal, estado
de vía colaborativo.

## Objetivo

Cerrar el módulo con las herramientas del superadmin: gestión de usuarios,
configuración de la calculadora, reportes financieros por unidad/conductor/
periodo, export CSV, audit log visible y alertas de mantenimiento de unidades.

## Entregable verificable

El superadmin puede:

1. Crear, editar y desactivar usuarios desde la UI
2. Editar las reglas de la calculadora sin tocar código
3. Ver el balance del mes por unidad: ingresos menos gastos
4. Filtrar un periodo (semana/mes/trimestre/año/personalizado) y ver el balance
5. Descargar ese balance como CSV abrible en Excel
6. Ver alertas de SOAT/RTV por vencer (≤30 días)
7. Ver el audit log con filtros por usuario y acción
8. Opcional: activar notificación WhatsApp al cierre diario

## Tareas

### 3.1 — Dashboard del superadmin

`/panel/admin/` (redirige aquí desde `/panel/` si `role='superadmin'`):

KPIs del día actual:

- Total ingresos / gastos / balance del día (consolidado)
- # cotizaciones emitidas hoy, aceptadas, rechazadas
- # recibos emitidos hoy + total recaudado
- Alertas: días no cerrados, unidades con SOAT/RTV por vencer, intentos de
  login sospechosos en las últimas 24h

Comparativa: hoy vs promedio 7 días (simple badge ↑/↓ con %).

Mobile-friendly: layout apilado en pantallas < 768px.

### 3.2 — CRUD de usuarios

`/panel/admin/usuarios/`:

- Listado con filtros por rol y estado
- Columnas: nombre, email, rol, teléfono, estado, último login

`/panel/admin/usuarios/nuevo/`:

- Form: email, nombre, rol (select), teléfono
- Genera password temporal → muestra **una sola vez** en la UI + botón
  "Copiar al portapapeles"
- Envío sugerido por WhatsApp con plantilla de mensaje (deep link a wa.me)
- Flag `must_change_password=1`

`/panel/admin/usuarios/[id]/`:

- Editar campos
- Botón "Resetear password" → genera nueva temporal, mismo flujo
- Botón "Desactivar" → soft delete (`active=0`); la sesión actual se invalida
- Botón "Impersonar" (solo si `active=1`) → crea sesión temporal para ese
  usuario, agrega banner "Estás impersonando a X. [Volver a tu cuenta]"
- Impersonación registra en `audit_log` start + stop con timestamp.

### 3.3 — Configuración de la calculadora

`/panel/admin/calculadora/`:

Editor formulario (no JSON crudo):

- Por cada tipo de servicio: tarifa base, $/km, $/m³, $/piso sin ascensor,
  $/persona extra, mínimo facturable
- Recargos globales: % fin de semana, % feriado, monto plano ruta nocturna
- Preview en vivo con un caso de ejemplo ("flete Wanchaq → San Jerónimo,
  5 km, 8 m³")

Al guardar:

- Valida con Zod (no negativos, no vacíos)
- Escribe `calc_config.rules_json` + `updated_by` + `updated_at`
- Escribe `audit_log('calc.update', diff=<campos modificados>)`
- Invalida cache in-memory

### 3.4 — Categorías de gasto

`/panel/admin/categorias-gasto/`:

- Listado editable (label, slug, umbral para foto obligatoria, activo)
- Crear, editar, soft-delete (no se borra si hay items que la usan, solo se
  desactiva)

### 3.5 — Mantenimiento de unidades

Extender `/panel/admin/unidades/[id]/` con pestaña "Mantenimiento":

- Tabla de registros históricos: fecha, kilometraje, tipo (aceite, frenos,
  llantas, RTV, SOAT, otro), monto, taller, notas, foto opcional de factura
- Formulario para añadir un registro
- Campos del encabezado:
  - Próximo cambio de aceite (km)
  - SOAT (fecha fin)
  - RTV (fecha fin)

Tabla `maintenance_records` (añadir en este sprint):

```sql
maintenance_records (
  id           TEXT PK,
  unit_id      TEXT NOT NULL REFERENCES units(id),
  occurred_at  TEXT NOT NULL,
  km           INTEGER,
  kind         TEXT NOT NULL,              -- 'aceite','frenos','llantas','rtv','soat','otro'
  amount_cents INTEGER NOT NULL,
  shop         TEXT,
  notes        TEXT,
  invoice_key  TEXT,                        -- foto/PDF factura en B2
  created_by   TEXT NOT NULL REFERENCES users(id),
  created_at   TEXT NOT NULL
)
```

Alerta en dashboard admin (§3.1) cuando falten ≤ 30 días para el vencimiento
de SOAT o RTV, o cuando el kilometraje esté a menos de 500 km del próximo
cambio de aceite (si el dato existe; si no, omitido).

### 3.6 — Balances financieros

`/panel/admin/balances/`:

Filtros:

- Periodo: hoy / esta semana / este mes / trimestre / año / custom
- Agrupador: por unidad / por conductor / por categoría de gasto
- Unidad específica (opcional)
- Conductor específico (opcional)

Tabla de resultado:

- Columnas: agrupador, ingresos (S/), gastos (S/), balance (S/), # días activos
- Totales al pie
- Gráfico simple de barras apiladas (ingresos vs gastos) por periodo,
  usando un componente SVG propio (evitar `chart.js` si se puede; un
  `<svg>` con Astro es suficiente)

Endpoint: `GET /api/panel/reports/balance?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=unit|driver|category&unit_id=&driver_id=`.

### 3.7 — Export CSV

Botón "Exportar CSV" en balances:

- Descarga `balance_YYYY-MM-DD_YYYY-MM-DD.csv`
- Encoding UTF-8 con BOM (abre correctamente en Excel PE)
- Montos en formato Soles con 2 decimales, separador coma
- Una fila por ítem (ingreso o gasto) + columnas: fecha, unidad, conductor,
  tipo (ingreso/gasto), categoría, descripción, origen, destino, monto,
  foto URL si existe
- Endpoint: `GET /api/panel/reports/export.csv?from=...&to=...`
- Streaming con `ReadableStream` para periodos grandes (> 10k filas)

### 3.8 — Visualizador de audit log

`/panel/admin/audit/`:

- Filtros: usuario, acción (enum de las acciones registradas), rango de
  fechas
- Columnas: timestamp, usuario, acción, target, IP, diff expandible (JSON)
- Paginación (50/página, infinite scroll)
- Retención: 12 meses. Cron mensual borra entradas > 12 meses.

### 3.9 — Configuración general del panel

`/panel/admin/configuracion/`:

- Datos fiscales del emisor (nombre razón social, RUC, dirección) usados en
  PDFs
- Plantilla de mensaje WhatsApp para envío de password temporal (editable)
- Zona horaria (fijo "America/Lima", solo lectura)
- Ver versión de la app, fecha de último deploy, estado del cron

### 3.10 — Notificaciones WhatsApp — FUERA DE ALCANCE MVP

Por decisión del propietario (Q2=D, ver
[PANEL-BACKLOG.md §15](../docs/PANEL-BACKLOG.md)), el MVP **no incluye**
notificaciones vía WhatsApp ni Telegram. Todas las notificaciones operativas
viajan por email (ver §3.24 de este sprint).

Esta tarea queda documentada y diferida a fase 2. La implementación sugerida
(Meta Cloud API con cola de reintento) se retoma cuando el propietario decida
habilitarla. No consumir tiempo del sprint en esto.

### 3.11 — 2FA TOTP (opcional)

Para rol `superadmin`:

1. En `/panel/admin/configuracion/` → sección "Seguridad" → botón "Activar 2FA"
2. Flujo: generar `totp_secret` → mostrar QR para Google Authenticator / Authy
   → pedir código de verificación → si correcto, persistir secret y marcar
   `totp_enabled=1`
3. En el login: si `totp_enabled=1`, tras validar password pedir código TOTP
4. Botón "Desactivar 2FA" requiere código válido para confirmar
5. Códigos de respaldo (10 × uso único) al activar 2FA, se muestran una sola
   vez para guardar

### 3.12 — Limpieza y pulido

- `/panel/admin/` con navegación en sidebar persistente (desktop) + bottom
  nav (mobile)
- Toasts consistentes para feedback de mutaciones
- Estados de carga en todas las tablas
- Estado vacío ("aún no hay usuarios") con CTA a crear

### 3.13 — Documentación operativa

`docs/PANEL-OPERACION.md`:

- Cómo crear el primer superadmin (seed)
- Cómo resetear contraseña si nadie puede entrar
- Cómo hacer backup/restore manual
- Cómo rotar claves de B2
- Qué hacer si el cron no corrió (ejecutar `node scripts/close-entries.mjs`)

### 3.14 — P&L por job (P1 item 3.3)

Tabla `job_costs` definida en PANEL-INTERNO.md §4.6.

1. En el detalle de un job `/panel/cotizador/trabajos/[id]/` añadir pestaña
   "Costos":
   - Listado de `job_costs` con categoría, monto, descripción, foto
   - Botón "Añadir costo" (solo superadmin o cotizador dueño del job)
   - Importar costos desde `trips.entry_items` del mismo día del conductor
     asignado (sugerencia asistida: muestra gastos candidatos, admin elige
     cuáles imputar)
2. Cálculo P&L mostrado en la pestaña:
   - Ingreso: `receipt.total_cents` del job (si emitido)
   - Costos: `SUM(job_costs.amount_cents)`
   - Margen absoluto y porcentaje
   - Badge: verde (margen > 30%), ámbar (10-30%), rojo (< 10%)
3. Endpoint `GET /api/panel/jobs/[id]/pnl`.
4. Reporte agregado: `/panel/admin/pnl/` con filtros por periodo, cliente,
   tipo de servicio, ruta. Columnas: # jobs, ingreso total, costo total,
   margen promedio.

### 3.15 — Caja chica (P1 item 3.5)

Tablas `petty_cash_accounts` y `petty_cash_entries` definidas en §4.6.

1. `/panel/admin/caja-chica/` — listado de cuentas (normalmente 1: "Caja
   principal").
2. Detalle de cuenta: saldo actual + movimientos (fecha, dirección, motivo,
   monto, link a item relacionado).
3. Formulario "Nueva entrada":
   - Dirección: In (ingreso) / Out (egreso)
   - Monto, motivo
   - Link opcional a `entry_item` (reembolso a conductor por gasto) o
     `receipt` (cobro en efectivo)
4. Saldo se recalcula en trigger SQLite (o query en lectura).
5. Reporte de conciliación: saldo teórico (suma de movimientos) vs saldo
   físico (campo manual) con diferencia resaltada.
6. Solo superadmin y cotizador pueden registrar. Conductor no.

### 3.16 — Tag "requiere factura SUNAT" (P1 item 3.6)

Campo `receipts.requires_sunat_invoice` ya añadido en §4.4.

1. En el form de emisión de recibo (PANEL-02), checkbox "Este servicio
   requiere factura electrónica SUNAT" (default off).
2. Listado de recibos muestra columna filtrable.
3. Reporte mensual `/panel/admin/sunat-pending/`:
   - Todos los recibos del mes con `requires_sunat_invoice=1`
   - Export CSV con las columnas que el contador necesita (número, fecha,
     cliente, RUC, total)
   - Botón "Marcar como facturado" (solo superadmin) para cerrar el ciclo
     (añadir columna `sunat_invoiced_at`).

### 3.17 — Document vault por unidad (P1 item 4.2)

Tabla `unit_documents` definida en §4.6. Bucket: `cuscomudanzas-panel-docs`.

1. En `/panel/admin/unidades/[id]/` añadir pestaña "Documentos":
   - Grid de documentos por tipo: SOAT, RTV, tarjeta de propiedad, seguro,
     póliza, otro
   - Cada card: archivo PDF/imagen, fecha de vencimiento, notas
   - Botón "Subir documento" → form con selector de tipo, fecha vencimiento,
     notas, archivo (upload presigned URL a bucket docs)
2. Alerta de vencimiento ≤ 30 días visible en dashboard admin (§3.1).
3. Conductor asignado puede **ver pero no subir** los documentos (acceso
   de solo lectura con URL firmada 1h) desde `/panel/conductor/unidad-docs/`
   para mostrarlos en un control policial.
4. Versionado B2 activo → subir un SOAT nuevo no borra el anterior.

### 3.18 — Document vault por conductor (P1 item 4.3)

Tabla `driver_documents` definida en §4.6. Bucket: `cuscomudanzas-panel-docs`.

1. En `/panel/admin/usuarios/[id]/` (rol conductor) añadir pestaña
   "Documentos":
   - Tipos: licencia, DNI, récord policial, certificado médico, contrato,
     otro
   - Mismo UX que 3.17
2. Alerta en dashboard admin cuando:
   - Licencia o certificado médico vencen en ≤ 30 días
   - Ya vencieron → flag rojo "Conductor no apto para manejar"
3. El propio conductor puede ver sus documentos (solo lectura) desde su
   perfil `/panel/conductor/mis-documentos/`.

### 3.19 — Funnel de conversión (P1 item 7.2)

En `/panel/admin/`, gráfico nuevo:

Etapas: Lead (quote.draft) → Sent → Accepted → Completed → Invoiced (receipt)

1. Cuenta de quotes en cada etapa para el periodo seleccionado (default
   mes actual).
2. Tasa de conversión entre etapas en %.
3. Comparativa con mes anterior.
4. Click en una etapa → abre listado filtrado.
5. Endpoint `GET /api/panel/reports/funnel?from=&to=`.

### 3.20 — Ingresos por ruta / servicio / cotizador (P1 item 7.3)

En `/panel/admin/balances/` añadir nuevos agrupadores:

- `groupBy=route` → origen+destino normalizados; top 10 rutas por ingreso
- `groupBy=service_type` → flete / mudanza / embalaje / etc.
- `groupBy=cotizador` → por `quotes.created_by`
- `groupBy=lead_source` → P1 item 2.5 consume aquí
- `groupBy=customer_tag` → P1 item 5.2 consume aquí
- `groupBy=rejection_reason` → qué razones dominan entre las perdidas

Todos los agrupadores soportan los filtros existentes (periodo, unidad,
conductor específicos).

### 3.21 — Emails transaccionales con Nodemailer (P1 item 8.2)

Por Q2=D, sin WhatsApp. Email es el canal de notificación MVP.

1. Instalar `nodemailer`.
2. `src/lib/panel/email.ts`:

   ```ts
   export async function sendMail({ to, subject, html, text }): Promise<void>;
   ```

   - Transport SMTP con las vars `SMTP_*` del `.env`.
   - Retry con backoff (3 intentos).

3. Plantillas HTML en `src/lib/panel/email-templates/`:
   - `welcome.html` — alta de usuario con password temporal
   - `password-reset.html` — reset con link (token expira 1h)
   - `daily-entry-reminder.html` — 11:00 Lima si el conductor no registró
   - `soat-expiring.html` — 30/15/5/1 días antes al admin
   - `receipt-issued.html` — cuando se emite recibo > umbral al admin
4. Cron adicional a las 08:00 Lima para enviar los recordatorios y alertas.
5. Test de humo: enviar a `ADMIN_EMAIL` en arranque del server con flag
   `DEBUG_SEND_TEST_EMAIL=1`.
6. Nota: ver memoria `project_panel_email.md` para detalles de Gmail SMTP.

### 3.22 — Import Excel de histórico (P1 item 8.5)

Tabla `import_jobs` definida en §4.6. Endpoints solo para superadmin.

1. `/panel/admin/importar/` — zona drag-drop para `.xlsx`.
2. Selector de tipo: Clientes / Cotizaciones cerradas / Registros diarios
   históricos.
3. Plantilla descargable por tipo (headers esperados, ejemplo de fila).
4. Pipeline: parse con `exceljs` → Zod validation → preview primeras 10
   filas + conteo de errores → confirmación → inserción en transacción.
5. Si alguna fila falla, se continúa y se acumula en `errors_json`; el admin
   descarga el Excel de errores para corregir.
6. Los registros importados se marcan con `imported_from_job_id` (migración
   menor a las tablas relevantes) para distinguirlos de data nativa.

### 3.23 — Vistas printables (P1 item 8.6)

Rutas con `?print=1` que generan versiones optimizadas para impresión:

- `/panel/cotizador/trabajos/[id]/?print=1` — hoja de ruta del día para
  el conductor (una página A4, letra grande, datos del cliente, dirección,
  teléfono, instrucciones)
- `/panel/admin/balances/?print=1` — balance del periodo como tabla simple
- `/panel/admin/pnl/?print=1` — P&L del periodo

CSS: `@media print { /* ocultar nav, simplificar */ }`. Tipografía serif
legible. Sin colores de fondo.

### 3.24 — Búsqueda global Ctrl+K (P1 item 9.3)

Componente `CommandPalette.astro`:

1. Atajo global `Ctrl+K` (o `Cmd+K` en Mac) abre modal.
2. Input busca en paralelo (debounce 200ms):
   - Usuarios (email, nombre)
   - Clientes (nombre, teléfono, RUC/DNI)
   - Cotizaciones (número, origen, destino)
   - Recibos (número)
   - Unidades (placa, alias)
   - Jobs (número)
3. Resultados agrupados por tipo, máx 5 por grupo.
4. Navegación con teclas arriba/abajo + Enter para abrir.
5. Endpoint `GET /api/panel/search?q=...` con autorización según rol
   (conductor solo ve lo propio).

### 3.25 — Accesibilidad WCAG 2.1 AA (P1 item 9.9)

1. Auditoría con `axe-core` en cada ruta clave durante desarrollo.
2. Checklist de cumplimiento:
   - Todos los inputs con `<label>` asociado
   - Focus visible con outline primario
   - Contraste texto/fondo ≥ 4.5:1 (normal) o 3:1 (grande)
   - Navegación por teclado completa (Tab/Shift+Tab)
   - `aria-live` para toasts y errores
   - `role="alert"` para banners críticos (pre-trip blocker, vía bloqueada)
   - Tablas con `<th scope>` y captions
   - Skip-link al inicio del layout del panel
3. Test con lector de pantalla (NVDA o VoiceOver) en 3 flujos:
   login, registrar gasto, emitir recibo.

### 3.26 — Listado de sesiones activas (P1 item 10.4)

1. En `/panel/mi-cuenta/` mostrar tabla de sesiones activas del usuario
   actual:
   - Inicio de sesión, IP, user-agent truncado, última actividad
   - Botón "Revocar" por sesión (destruye esa sesión en Lucia)
   - Botón "Cerrar todas las demás" (mantiene la actual)
2. Admin puede ver sesiones de cualquier usuario en
   `/panel/admin/usuarios/[id]/` pestaña "Sesiones" con misma UI.
3. Registrar revocación en `audit_log` con IP original.

### 3.27 — Expiración de password temporal (P1 item 10.10)

1. Añadir campo `temp_password_expires_at` a `users`.
2. Cuando superadmin crea usuario o resetea password, setear a
   `now() + 24 horas`.
3. En login: si `must_change_password=1` y `now() > temp_password_expires_at`,
   rechazar con mensaje "Contraseña temporal expirada, pide al admin que la
   regenere".
4. Reset regenera la temporal y vuelve a setear la expiración.

### 3.28 — Estado de vía colaborativo (P1 items 12.1-12.2)

Tabla `route_status_reports` definida en §4.6.

1. `/panel/conductor/reportar-via/` — form rápido:
   - Ruta (select; opciones pre-cargadas: Cusco-Challhuahuacho,
     Cusco-Abancay, Cusco-Sicuani, Cusco-Tambobamba, etc.)
   - Estado: OK / Bloqueada / Precaución / Desvío
   - Nota (requerida si no es OK): "paro en Livitaca hasta las 18:00"
2. El reporte **caduca automáticamente a las 24h** (`expires_at`).
3. Banner global en el panel del conductor y del cotizador si hay reportes
   activos para una ruta que está en la cotización/job.
4. Endpoint público (no auth) `GET /api/panel/route-status` para que un
   futuro widget en el sitio público pueda mostrar info, si se quiere.
5. Dashboard admin muestra lista de reportes activos y quién los reportó.

## Criterios de aceptación

- [ ] Superadmin da de alta un usuario y éste puede loguearse con la temporal
- [ ] Reseteo de contraseña funciona y la nueva es forzada a cambiarse
- [ ] Editar calculadora impacta la nueva cotización inmediatamente
- [ ] Balance del mes actual coincide con una suma manual de prueba
- [ ] Export CSV abre bien en Excel con acentos y soles
- [ ] Alerta de SOAT por vencer aparece cuando se configura fecha a 29 días
- [ ] Audit log captura al menos: login, logout, create/update/delete de
      usuarios, unidades, quotes, receipts, calc_config
- [ ] Si 2FA está activo, password sola no basta para entrar
- [ ] Impersonación funciona y queda registrada en audit
- [ ] Lighthouse del panel (accesibilidad + best practices) ≥ 90
- [ ] **P&L por job** muestra margen real y lo agrega por periodo (P1)
- [ ] **Caja chica** con entradas/salidas y saldo conciliado (P1)
- [ ] **Recibos con tag SUNAT** exportables en CSV para el contador (P1)
- [ ] **Document vault** (unidad + conductor) con alertas de vencimiento (P1)
- [ ] **Funnel de conversión** en dashboard con % entre etapas (P1)
- [ ] **Balances agrupables** por ruta/servicio/cotizador/lead/etiqueta/razón (P1)
- [ ] **Emails transaccionales** llegan en ≤ 5s (alta, reset, recordatorio) (P1)
- [ ] **Import Excel** procesa 500 filas sin caídas, errores quedan en
      `import_jobs` (P1)
- [ ] **Vistas printables** imprimen correctamente en A4 sin navegación (P1)
- [ ] **Ctrl+K** abre el command palette en < 100 ms y navega con teclado (P1)
- [ ] **WCAG 2.1 AA**: lector de pantalla completa 3 flujos sin bloqueos (P1)
- [ ] **Sesiones activas** visibles y revocables por el propio usuario (P1)
- [ ] **Password temporal** expira a 24h y el sistema lo informa (P1)
- [ ] **Estado de vía** reportado por un conductor aparece como banner a los
      demás y caduca a 24h (P1)

## Después de este sprint

Se retoma el plan original del sitio público:

1. **[SPRINT-10 — VPS + Deploy](SPRINT-10-vps-deploy.md)** — ahora el deploy
   debe contemplar el runtime Node + systemd + persistencia de DB + backups
2. **[SPRINT-11 — QA](SPRINT-11-qa-prelaunch.md)** — QA incluye el panel
3. **[SPRINT-12 — Lanzamiento](SPRINT-12-launch.md)** — go-live del sitio
   público y del panel juntos
