# Panel Interno — Arquitectura y Plan Técnico

> Documento maestro del módulo de gestión interna (`/panel/`) de cuscomudanzas.com.
> Aprobado por el propietario el 2026-04-24 para ejecución **antes** del
> lanzamiento público (Opción B: panel primero → SPRINT-10/11/12 después).
>
> Módulo dividido en 3 sprints: [PANEL-01](../sprints/PANEL-01-auth-conductores.md),
> [PANEL-02](../sprints/PANEL-02-cotizaciones-recibos.md),
> [PANEL-03](../sprints/PANEL-03-admin-reportes.md).

## 1. Resumen ejecutivo

Sistema interno de gestión operativa y financiera para Expresos Ñan, convive con
el sitio público bajo el mismo dominio (`cuscomudanzas.com/panel/`) pero con
autenticación obligatoria y nunca indexado.

Tres ejes funcionales:

1. **Conductores** — registran diariamente ingresos (fletes, mudanzas) y gastos
   (combustible, lavado, peajes, alimentación, reparaciones) por unidad.
   Cada ítem puede llevar una foto. El formulario del día N se cierra a las
   **12:00 del día N+1** (hora Lima), no admite cambios después.
2. **Cotizadores** — emiten cotizaciones de servicio (flete, mudanza, embalaje,
   almacenaje, armado) con una calculadora opcional, convierten cotizaciones en
   trabajos y generan recibos PDF numerados.
3. **SuperAdmin** — CRUD de usuarios y unidades, configuración de la calculadora,
   visualización de balances por unidad/conductor/periodo, exportar CSV, audit log.

## 2. Usuarios y roles

| Rol          | Cantidad est. | Capacidades                                                              |
| ------------ | ------------- | ------------------------------------------------------------------------ |
| `superadmin` | 1-2           | Todo. CRUD usuarios + unidades, configuración, reportes, impersonación.  |
| `cotizador`  | 1-3           | Crear/editar cotizaciones, emitir recibos, leer balances de sus recibos. |
| `conductor`  | 3-10          | Registrar diario de su(s) unidad(es) asignada(s). Leer su historial.     |

Diseño RBAC simple: **un usuario, un rol**. El superadmin cubre cualquier caso
borde con impersonación temporal (`/panel/admin/impersonar/[userId]`).

## 3. Arquitectura técnica

### 3.1 Stack

| Capa         | Tecnología                                            | Por qué                                                   |
| ------------ | ----------------------------------------------------- | --------------------------------------------------------- |
| Framework    | **Astro 6 en modo `hybrid`**                          | Reusa el repo; `/panel/` es SSR, resto del sitio estático |
| Runtime      | **Node 24 LTS** + `@astrojs/node` (standalone)        | Ya instalado en el VPS                                    |
| ORM          | **Drizzle ORM**                                       | Tipado end-to-end, migraciones declarativas               |
| DB           | **SQLite** vía `better-sqlite3` (archivo en `/data/`) | Cero costo externo, suficiente para < 100 usuarios        |
| Auth         | **Lucia v3** con sesiones en DB                       | Simple, type-safe, adaptador sqlite oficial               |
| Hash         | **Argon2id** (`@node-rs/argon2`)                      | Estándar actual (mejor que bcrypt)                        |
| Storage      | **Backblaze B2** vía `@aws-sdk/client-s3`             | Ya en stack del proyecto (backups). S3-compatible.        |
| Upload       | **Presigned URL directo del navegador a B2**          | No pasa por el servidor → baja el egress del VPS          |
| PDF          | **`pdf-lib`**                                         | Puro JS, sin dependencias nativas                         |
| QR           | **`qrcode`**                                          | Para el verificador público de recibos                    |
| Validación   | **Zod** (ya en el proyecto)                           | Schemas compartidos cliente/servidor                      |
| UI           | **Tailwind 4** + componentes del design system        | Reutilizar [src/components](../src/components/)           |
| PWA          | **`@vite-pwa/astro`**                                 | Instalable + offline básico                               |
| Cron interno | **`node-cron`** dentro del proceso Astro              | Cierre diario a las 12:00 Lima                            |

### 3.2 Integración con el sitio actual

Cambio en `astro.config.mjs`:

```js
export default defineConfig({
  output: 'hybrid', // <- cambia de 'static' implícito
  adapter: node({ mode: 'standalone' }),
  // ...resto igual
});
```

- Todas las páginas públicas existentes quedan con `export const prerender = true`
  (o se añade `prerender: true` a su frontmatter) para conservar SSG y SEO.
- Solo las rutas bajo `src/pages/panel/**` y `src/pages/api/panel/**` usan SSR.
- `robots.txt` ya bloquea `/admin/` y `/api/`; añadimos `Disallow: /panel/`.

### 3.3 Estructura de archivos

```text
src/
  middleware.ts                      # Guard de auth global (solo /panel/** y /api/panel/**)
  db/
    schema.ts                        # Drizzle schema (todas las tablas)
    client.ts                        # Cliente singleton better-sqlite3
    migrations/                      # Migraciones generadas (drizzle-kit)
  lib/
    auth/
      lucia.ts                       # Config Lucia + adapter
      password.ts                    # Argon2 hash/verify
      session.ts                     # Helpers Astro.locals
      rate-limit.ts                  # Login throttle (in-memory o DB)
    panel/
      storage.ts                     # Presigned URL B2
      pdf-receipt.ts                 # Builder PDF de recibo
      pricing.ts                     # Calculadora de precios
      cron.ts                        # node-cron: cierre diario 12:00
      audit.ts                       # Escritor de audit_log
  pages/
    panel/
      index.astro                    # Dashboard por rol
      login.astro
      logout.ts                      # POST → destruye sesión
      conductor/
        hoy.astro                    # Formulario del día actual
        historial.astro              # Días anteriores (solo lectura tras cierre)
      cotizador/
        nueva.astro
        listado.astro
        [id].astro                   # Detalle + convertir a trabajo
        recibo/[id].astro            # Preview + descargar PDF
      admin/
        usuarios/
          index.astro
          nuevo.astro
          [id].astro
        unidades/
          index.astro
          [id].astro                 # Datos + mantenimiento
        calculadora.astro            # Config de reglas
        categorias-gasto.astro
        balances.astro
        audit.astro
    api/panel/
      login.ts                       # POST
      upload-url.ts                  # POST → presigned URL B2
      daily-entries/
        create.ts
        add-item.ts
        close.ts
      quotes/
        create.ts
        update.ts
        accept.ts
        generate-receipt.ts
      users/
        create.ts
        update.ts
        delete.ts
    verificar/
      [uuid].astro                   # Público (SSR), lee receipt.uuid
```

### 3.4 Despliegue

El VPS corre el proceso Node. Nginx hace reverse proxy:

```nginx
server {
  location / {
    try_files $uri $uri/ @node;   # Archivos estáticos del build
  }
  location /panel/    { proxy_pass http://127.0.0.1:4321; }
  location /api/      { proxy_pass http://127.0.0.1:4321; }
  location /verificar/ { proxy_pass http://127.0.0.1:4321; }
  location @node      { proxy_pass http://127.0.0.1:4321; }
}
```

Servicio systemd (`cuscomudanzas.service`) que arranca `node ./dist/server/entry.mjs`.
Detalles en [SPRINT-10](../sprints/SPRINT-10-vps-deploy.md).

### 3.5 Variables de entorno nuevas

```bash
# .env.production
DATABASE_URL=file:/var/lib/cuscomudanzas/panel.db
SESSION_COOKIE_NAME=cm_session
SESSION_COOKIE_SECURE=true
SITE_URL=https://cuscomudanzas.com
TZ=America/Lima

# Storage B2 — dos buckets separados (Q3=B)
B2_KEY_ID=xxx
B2_APPLICATION_KEY=xxx
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_BUCKET_FOTOS=cuscomudanzas-panel-fotos    # fotos operativas, retención 2 años
B2_BUCKET_DOCS=cuscomudanzas-panel-docs      # docs legales, versionado, retención indefinida

# Email SMTP — Gmail con App Password (Q2=D, sin WhatsApp)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<cuenta-operativa>@gmail.com
SMTP_PASSWORD=<app-password-de-16-caracteres>
SMTP_FROM_NAME=Expresos Ñan
SMTP_FROM_ADDRESS=<cuenta-operativa>@gmail.com
```

> **Nota:** No se configura integración WhatsApp/Telegram en el MVP. La sección
> correspondiente en PANEL-03 queda como fase 2 (ver
> [PANEL-BACKLOG.md §15](PANEL-BACKLOG.md)).

## 4. Modelo de datos

Todas las tablas usan `id` TEXT (ULID) como PK, `created_at`/`updated_at` TEXT
ISO-8601 en UTC. Campos monetarios en **céntimos** (INTEGER) para evitar errores
de punto flotante.

### 4.1 Autenticación

```sql
users (
  id            TEXT PK,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('superadmin','cotizador','conductor')),
  password_hash TEXT NOT NULL,
  phone         TEXT,                 -- WhatsApp
  active        INTEGER NOT NULL DEFAULT 1,
  totp_secret   TEXT,                 -- opcional, solo superadmin
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
)

sessions (                            -- Lucia
  id          TEXT PK,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  INTEGER NOT NULL
)

login_attempts (                      -- rate limiting
  email       TEXT,
  ip          TEXT,
  at          INTEGER NOT NULL,
  success     INTEGER NOT NULL
)
```

### 4.2 Unidades y asignación

```sql
units (
  id              TEXT PK,
  plate           TEXT UNIQUE NOT NULL,      -- placa
  tonnage         INTEGER NOT NULL CHECK (tonnage IN (1,2,4)),
  alias           TEXT,                       -- ej 'Ñan-1'
  soat_expires    TEXT,                       -- yyyy-mm-dd
  rtv_expires     TEXT,
  next_service_km INTEGER,                    -- kilometraje próximo mantenimiento
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
)

driver_assignments (
  id          TEXT PK,
  user_id     TEXT NOT NULL REFERENCES users(id),
  unit_id     TEXT NOT NULL REFERENCES units(id),
  starts_at   TEXT NOT NULL,                  -- fecha inicio
  ends_at     TEXT,                           -- null = vigente
  UNIQUE(user_id, unit_id, starts_at)
)
-- Invariante: dado unit_id + fecha, existe ≤ 1 asignación vigente.
```

### 4.3 Registro diario (extendido con P1 promovidos)

```sql
daily_entries (
  id                TEXT PK,
  unit_id           TEXT NOT NULL REFERENCES units(id),
  driver_id         TEXT NOT NULL REFERENCES users(id),
  entry_date        TEXT NOT NULL,              -- yyyy-mm-dd (hora Lima del día de salida)
  odometer_start_km INTEGER,                    -- P1 item 1.5: km al iniciar turno
  odometer_end_km   INTEGER,                    -- P1 item 1.5: km al cerrar turno
  pre_trip_check_id TEXT REFERENCES pre_trip_checks(id),  -- P1 item 1.4
  closed_at         TEXT,                       -- null = abierto
  notes             TEXT,
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  UNIQUE(unit_id, entry_date)
)

-- P1 item 1.4: checklist pre-viaje (llantas, luces, mantas, correas, etc.)
pre_trip_checks (
  id          TEXT PK,
  unit_id     TEXT NOT NULL REFERENCES units(id),
  driver_id   TEXT NOT NULL REFERENCES users(id),
  entry_date  TEXT NOT NULL,
  items_json  TEXT NOT NULL,                    -- JSON: [{label, status: 'ok|fail|na', note}]
  blocker     INTEGER NOT NULL DEFAULT 0,       -- 1 si algún ítem crítico falló (no debe salir)
  photo_key   TEXT,                             -- foto general opcional
  signed_at   TEXT NOT NULL,                    -- timestamp conductor confirma
  created_at  TEXT NOT NULL,
  UNIQUE(unit_id, entry_date)
)

-- P1 item 1.6: múltiples viajes por día con hora inicio/fin
trips (
  id            TEXT PK,
  entry_id      TEXT NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  service_kind  TEXT NOT NULL CHECK (service_kind IN
                 ('flete','mudanza','embalaje','armado','taxi_carga','otro')),
  origin        TEXT NOT NULL,                  -- 'San Sebastián'
  destination   TEXT NOT NULL,                  -- 'San Jerónimo'
  started_at    TEXT NOT NULL,                  -- timestamp UTC
  ended_at      TEXT,                           -- null mientras en curso
  crew_size     INTEGER NOT NULL DEFAULT 1,
  customer_name TEXT,                           -- opcional, texto libre
  job_id        TEXT REFERENCES jobs(id),       -- nullable: si el viaje viene de una cotización
  amount_cents  INTEGER NOT NULL CHECK (amount_cents >= 0),
  notes         TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
)

entry_items (
  id            TEXT PK,
  entry_id      TEXT NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  trip_id       TEXT REFERENCES trips(id),      -- NULL para gastos del día no imputables a un viaje
  kind          TEXT NOT NULL CHECK (kind IN ('income','expense')),
  category_id   TEXT REFERENCES expense_categories(id),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents >= 0),
  description   TEXT NOT NULL,
  occurred_at   TEXT NOT NULL,
  photo_key     TEXT,                           -- bucket 'cuscomudanzas-panel-fotos'
  created_at    TEXT NOT NULL
)
-- Nota: con el rediseño, el INGRESO del viaje se modela con trips.amount_cents.
-- entry_items.kind='income' queda para ingresos eventuales no ligados a un viaje
-- (por ejemplo: propina directa, compensación puntual). El principal flujo de
-- ingreso va por la tabla trips.

expense_categories (
  id           TEXT PK,
  slug         TEXT UNIQUE NOT NULL,
  label_es     TEXT NOT NULL,
  requires_photo_above_cents INTEGER,
  active       INTEGER NOT NULL DEFAULT 1
)
```

**Regla de cierre**: un cron a las 12:00:00 Lima marca `closed_at = now()` para
toda fila `daily_entries` con `entry_date <= yesterday` y `closed_at IS NULL`.
Mutaciones rechazadas con 403 si `closed_at IS NOT NULL`.

### 4.4 Cotizaciones y recibos (extendido con P1 promovidos)

```sql
customers (
  id            TEXT PK,
  name          TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  doc_type      TEXT CHECK (doc_type IN ('DNI','RUC','CE','Pasaporte')),
  doc_number    TEXT,
  tags_json     TEXT NOT NULL DEFAULT '[]',   -- P1 item 5.2: ['familia','expat','las-bambas']
  blacklisted   INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
)

-- P1 item 2.4: plantillas de servicios para 1-click
quote_templates (
  id               TEXT PK,
  name             TEXT NOT NULL,             -- 'Depto 2 amb Wanchaq → San Jerónimo'
  service_type     TEXT NOT NULL,
  default_fields   TEXT NOT NULL,             -- JSON con valores default
  default_items    TEXT NOT NULL,             -- JSON array de quote_items
  created_by       TEXT NOT NULL REFERENCES users(id),
  active           INTEGER NOT NULL DEFAULT 1,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
)

quotes (
  id               TEXT PK,
  number           TEXT UNIQUE NOT NULL,      -- COT-2026-0001
  customer_id      TEXT NOT NULL REFERENCES customers(id),
  service_type     TEXT NOT NULL CHECK (service_type IN
                     ('flete','mudanza_personal','mudanza_embalaje','embalaje_solo',
                      'armado_desarmado','almacenaje','solo_vehiculo_personal','otro')),
  template_id      TEXT REFERENCES quote_templates(id),  -- P1 item 2.4
  lead_source      TEXT CHECK (lead_source IN
                     ('whatsapp','google','referido','walk-in','recurrente','otro')),  -- P1 item 2.5
  origin           TEXT,
  destination      TEXT,
  tentative_date   TEXT,
  volume_m3        REAL,
  distance_km      REAL,
  floors_origin    INTEGER,
  floors_dest      INTEGER,
  has_elevator     INTEGER DEFAULT 0,
  crew_size        INTEGER DEFAULT 2,
  total_cents      INTEGER NOT NULL,
  used_calculator  INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','sent','accepted','rejected','expired','completed','canceled')),
  expires_at       TEXT,                      -- P1 item 2.7: default +15 días al pasar a 'sent'
  rejection_reason TEXT CHECK (rejection_reason IN
                     ('precio','fecha','competidor','sin-respuesta','otro',NULL)),  -- P1 item 2.6
  rejection_note   TEXT,                      -- texto libre complementario
  created_by       TEXT NOT NULL REFERENCES users(id),
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
)

quote_items (
  id           TEXT PK,
  quote_id     TEXT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  order_idx    INTEGER NOT NULL
)

jobs (                                          -- cotización aceptada → trabajo
  id              TEXT PK,
  quote_id        TEXT NOT NULL REFERENCES quotes(id),
  assigned_unit_id TEXT REFERENCES units(id),
  assigned_driver_id TEXT REFERENCES users(id),
  scheduled_date  TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled','in_progress','completed','canceled')),
  completed_at    TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
)

receipts (
  id                   TEXT PK,
  uuid                 TEXT UNIQUE NOT NULL,     -- para /verificar/[uuid]
  number               TEXT UNIQUE NOT NULL,     -- REC-2026-0001
  quote_id             TEXT REFERENCES quotes(id),
  job_id               TEXT REFERENCES jobs(id),
  customer_id          TEXT NOT NULL REFERENCES customers(id),
  total_cents          INTEGER NOT NULL,
  payment_method       TEXT NOT NULL CHECK (payment_method IN ('efectivo','transferencia','yape','plin','otro')),
  doc_kind             TEXT NOT NULL DEFAULT 'recibo' CHECK (doc_kind IN ('recibo','boleta_ref','factura_ref')),
  requires_sunat_invoice INTEGER NOT NULL DEFAULT 0, -- P1 item 3.6: flag para el contador
  pdf_key              TEXT,                     -- bucket 'cuscomudanzas-panel-docs'
  issued_by            TEXT NOT NULL REFERENCES users(id),
  issued_at            TEXT NOT NULL,
  voided_at            TEXT,
  void_reason          TEXT
)
-- Si doc_kind='boleta_ref' o 'factura_ref', se asume que el comprobante
-- tributario real se emite en un sistema externo. Este recibo es interno.
-- requires_sunat_invoice=1 marca recibos que el contador debe incluir en SUNAT.
```

### 4.5 Configuración de calculadora y audit

```sql
calc_config (                                   -- singleton: id='current'
  id            TEXT PK DEFAULT 'current',
  rules_json    TEXT NOT NULL,                  -- ver §5.4
  updated_by    TEXT REFERENCES users(id),
  updated_at    TEXT NOT NULL
)

audit_log (
  id         TEXT PK,
  user_id    TEXT REFERENCES users(id),
  action     TEXT NOT NULL,                     -- 'user.create','unit.update','entry.close', ...
  target     TEXT,                              -- 'user:abc123'
  diff_json  TEXT,
  ip         TEXT,
  at         TEXT NOT NULL
)
```

### 4.6 Tablas adicionales P1 (admin)

```sql
-- P1 item 3.3: P&L por job
-- Gastos imputables a un job se registran aquí. Permite calcular margen.
-- No reemplaza entry_items; se puede linkear trip.job_id → lookup.
job_costs (
  id            TEXT PK,
  job_id        TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  category_id   TEXT REFERENCES expense_categories(id),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents >= 0),
  description   TEXT NOT NULL,
  photo_key     TEXT,
  created_by    TEXT NOT NULL REFERENCES users(id),
  created_at    TEXT NOT NULL
)

-- P1 item 3.5: caja chica centralizada
petty_cash_accounts (
  id            TEXT PK,
  name          TEXT UNIQUE NOT NULL,           -- 'Caja principal'
  balance_cents INTEGER NOT NULL DEFAULT 0,     -- snapshot; se recalcula con trigger
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL
)

petty_cash_entries (
  id            TEXT PK,
  account_id    TEXT NOT NULL REFERENCES petty_cash_accounts(id),
  direction     TEXT NOT NULL CHECK (direction IN ('in','out')),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  reason        TEXT NOT NULL,
  linked_entry_item_id TEXT REFERENCES entry_items(id),  -- si es reembolso de gasto
  linked_receipt_id    TEXT REFERENCES receipts(id),     -- si es cobro
  created_by    TEXT NOT NULL REFERENCES users(id),
  created_at    TEXT NOT NULL
)

-- P1 items 4.2 y 4.3: document vault (bucket 'cuscomudanzas-panel-docs')
unit_documents (
  id           TEXT PK,
  unit_id      TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN
                ('soat','rtv','tarjeta_propiedad','seguro','poliza','otro')),
  file_key     TEXT NOT NULL,
  valid_until  TEXT,                            -- yyyy-mm-dd, nullable
  notes        TEXT,
  uploaded_by  TEXT NOT NULL REFERENCES users(id),
  uploaded_at  TEXT NOT NULL
)

driver_documents (
  id           TEXT PK,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN
                ('licencia','dni','record_policial','certificado_medico','contrato','otro')),
  file_key     TEXT NOT NULL,
  valid_until  TEXT,
  notes        TEXT,
  uploaded_by  TEXT NOT NULL REFERENCES users(id),
  uploaded_at  TEXT NOT NULL
)

-- P1 items 12.1-12.2: estado de vía colaborativo
route_status_reports (
  id           TEXT PK,
  route_slug   TEXT NOT NULL,                   -- 'cusco-challhuahuacho', 'cusco-abancay'
  status       TEXT NOT NULL CHECK (status IN
                ('ok','bloqueada','precaucion','desvio')),
  note         TEXT NOT NULL,                   -- 'paro en Livitaca hasta las 18:00'
  reported_by  TEXT NOT NULL REFERENCES users(id),
  reported_at  TEXT NOT NULL,
  expires_at   TEXT                             -- auto-caduca a las 24h
)

-- P1 item 2.4 bonus: catálogo de fuentes de lead (para analytics §7.3)
-- lead_source ya es enum en quotes; esta tabla opcional da labels i18n.

-- P1 item 8.5: import jobs para auditoría de cargas Excel
import_jobs (
  id            TEXT PK,
  kind          TEXT NOT NULL,                  -- 'customers','quotes','entries'
  file_name     TEXT NOT NULL,
  rows_total    INTEGER NOT NULL,
  rows_ok       INTEGER NOT NULL,
  rows_failed   INTEGER NOT NULL,
  errors_json   TEXT,                           -- JSON con detalle de filas que fallaron
  imported_by   TEXT NOT NULL REFERENCES users(id),
  imported_at   TEXT NOT NULL
)
```

## 5. Flujos críticos

### 5.1 Cierre diario del conductor

- El formulario muestra **solo el día activo** del conductor para cada unidad
  que tiene asignada.
- Un "día activo" es cualquier `entry_date` cuyo `closed_at` sigue siendo NULL.
- Ventana operativa: el conductor puede editar libremente hasta las **12:00
  Lima del día siguiente**. A esa hora el cron cierra todo lo pendiente.
- Si el conductor viaja de noche cruzando días (ej. Cusco→Challhuahuacho sale
  23:00 del lunes, llega 09:00 del martes), se usa **la fecha de salida** como
  `entry_date` (criterio documentado y fijo).
- Regla anti-errores: no se admite `entry_date` en el futuro. Sí se admite
  crear registros para días pasados **solo mientras estén abiertos** (o sea,
  hasta 12h después de cerrar su día de pertenencia).

### 5.2 Cotización → Trabajo → Recibo

```text
quote.draft → quote.sent → quote.accepted → job.scheduled → job.completed → receipt.issued
                        ↘ quote.rejected
```

- Un `quote` en estado `accepted` genera automáticamente un `job` asociado.
- El cotizador asigna la unidad y el conductor al job (opcional; puede dejarse
  abierto).
- Al marcar el job como `completed`, el cotizador puede emitir el recibo con un
  click; el recibo hereda `customer_id` y `total_cents` del quote.
- El recibo PDF tiene:
  - Logo + datos fiscales de Expresos Ñan
  - Número secuencial (`REC-2026-0001`)
  - Datos del cliente
  - Servicio, origen, destino, fecha
  - Desglose de ítems
  - Total en soles
  - Método de pago
  - QR al final que apunta a `https://cuscomudanzas.com/verificar/[uuid]`
- `/verificar/[uuid]` es público (no requiere login), muestra un extracto del
  recibo con fecha de emisión y estado (`válido` / `anulado`). Evita recibos
  fotoshopeados.

### 5.3 Alta de usuarios

- Solo `superadmin` puede crear usuarios.
- El alta genera una **contraseña temporal** de un solo uso que se entrega por
  WhatsApp al nuevo usuario.
- El primer login fuerza cambio de contraseña (campo `must_change_password` en
  `users`).

### 5.4 Calculadora de precios (configurable)

El JSON en `calc_config.rules_json` define reglas por tipo de servicio:

```jsonc
{
  "flete": {
    "base_cents": 10000, // S/ 100 base
    "per_km_cents": 300, // S/ 3/km
    "per_m3_cents": 1500, // S/ 15/m3
    "min_cents": 15000,
  },
  "mudanza_personal": {
    "base_cents": 20000,
    "per_km_cents": 500,
    "per_m3_cents": 3000,
    "per_crew_cents": 8000, // S/ 80 por persona adicional
    "per_floor_without_elevator_cents": 3000,
    "min_cents": 30000,
  },
  // ... otros servicios
  "surcharges": {
    "weekend_pct": 10, // +10% sábado/domingo
    "holiday_pct": 15,
    "overnight_route_flat_cents": 20000,
  },
}
```

La calculadora es **sugerencia**, no obligatoria. El cotizador puede ignorarla
y digitar un total. Se registra `used_calculator` para estadística.

## 6. UI/UX

### 6.1 Navegación por rol

- **Conductor**: layout minimal, mobile-first, dos pestañas (Hoy, Historial).
- **Cotizador**: layout con sidebar, secciones (Nueva, Listado, Recibos, Clientes).
- **SuperAdmin**: sidebar expandida (Usuarios, Unidades, Calculadora, Categorías,
  Balances, Audit, Configuración).

### 6.2 Mobile-first para conductores

Los conductores usan el teléfono en campo. El formulario de ingreso/gasto debe:

- Botones grandes (touch target ≥ 44×44 px)
- Teclado numérico al enfocar monto (`inputmode="numeric"`)
- Cámara directa al subir foto (`capture="environment"` en `<input type="file">`)
- Autoguardado local cada cambio (`localStorage` backup en caso de crash)

### 6.3 PWA

- Instalable desde Chrome Android (Add to Home Screen)
- Service Worker cachea assets + shell del panel
- Estrategia: **stale-while-revalidate** para GETs públicos; **NetworkOnly** con
  cola de reintentos (`background-sync`) para POSTs al `/api/panel/*`.
- Cuando no hay red: el formulario se guarda local, el Service Worker lo
  reintenta cuando vuelve la conexión, muestra badge de "pendiente" al
  conductor.
- Indicador online/offline visible en el header del panel.

## 7. Seguridad

- **Passwords**: Argon2id (`memory=19MiB`, `iterations=2`, `parallelism=1` —
  parámetros OWASP 2023).
- **Sesiones**: cookie `cm_session` `HttpOnly`, `Secure`, `SameSite=Strict`,
  `Path=/`. Expiración 30 días con rotación cada 7.
- **CSRF**: origin check en todos los POST (`Origin` / `Referer` vs
  `SITE_URL`). No se usan tokens CSRF en formulario porque SameSite=Strict
  cubre el vector principal.
- **Rate limiting**: login max 5 intentos / 15 min por (email, IP). Tabla
  `login_attempts` podada por cron cada hora.
- **Autorización**: middleware en `src/middleware.ts` para todo `/panel/**` y
  `/api/panel/**`. Matriz rol ↔ ruta en [src/lib/auth/rbac.ts].
- **Uploads**: el servidor genera presigned URL con expiración 5 min, contenido-tipo
  fijado a `image/jpeg` o `image/png`, tamaño máx 5 MB. El cliente sube
  directo a B2. El servidor NO ve los bytes.
- **Entrada de DB**: Drizzle usa parametrización (no concat strings).
- **Logs**: no loguear passwords, tokens ni contenido de fotos. Loguear
  user_id, action, IP.
- **Dependencias**: `npm audit --production` en CI.
- **Secretos**: `.env.production` fuera del repo, permisos 600, owner `node`.

## 8. Backups y retención de storage

**Base de datos (`/var/lib/cuscomudanzas/panel.db`):**

- Snapshot diario con `sqlite3 .backup` (consistente, lock-free) a
  `/tmp/panel-YYYY-MM-DD.db` → `rclone sync` a B2 bucket
  `cuscomudanzas-backups/panel/` (bucket de backups existente, ya configurado).
- Retención: 30 snapshots diarios + 12 mensuales.
- Rehearsal de restore trimestral (script en `server/scripts/restore-panel.sh`).

**Bucket de fotos operativas (`cuscomudanzas-panel-fotos`):**

- Fotos de ingresos, gastos y pre-trip checklists.
- Lifecycle rule: archive a clase de almacenamiento fría a los 2 años.
- No versionado (fotos son append-only; si se borra un item se borra su foto).

**Bucket de documentos legales (`cuscomudanzas-panel-docs`):**

- SOAT/RTV/tarjeta de propiedad/seguro por unidad, licencia/DNI/contrato por
  conductor, PDFs de recibos emitidos.
- Versionado **habilitado** (una SOAT renovada no pisa la anterior).
- Retención indefinida.
- CORS permite solo `https://cuscomudanzas.com`.

## 9. Funcionalidades adicionales

El **backlog completo** con ~80 funcionalidades priorizadas (P0/P1/P2/P3) y
estimadas (S/M/L/XL) vive en [PANEL-BACKLOG.md](PANEL-BACKLOG.md), organizado
por dominio:

1. Conductor en campo (pre-trip, odómetro, múltiples viajes, incidentes, firma digital)
2. Cotizaciones y ventas (plantillas, lead source, razón de rechazo, calendario, follow-up)
3. Financiero (P&L por job, caja chica, comisiones, cuentas por cobrar, SUNAT)
4. Flota (document vault, eficiencia combustible, utilización, depreciación)
5. CRM (etiquetas, historial, descuentos recurrentes, reviews, referidos)
6. Compliance (incidentes, seguros, flags automáticos)
7. Analytics/BI (funnel, ingresos por ruta/servicio/cotizador, YoY)
8. Integraciones (email, iCal, webhooks, import Excel, print)
9. UX/productividad (Ctrl+K search, atajos, bulk actions, dark mode)
10. Seguridad extendida (2FA para todos, sesiones activas, IP whitelist)
11. Portal del cliente (login OTP, self-service — fase 3)
12. Perú/Cusco específico (estado de vía Las Bambas, multi-currency, SUNAT)

**Decisión del propietario (2026-04-24):** se aprobaron los ~20 items P1
del §13 al MVP. Los sprints PANEL-01/02/03 reflejan el alcance ampliado con
tareas específicas (tablas nuevas, rutas, endpoints). Ver
[PANEL-BACKLOG.md §15](PANEL-BACKLOG.md) para el resumen de decisiones
tomadas (Q1=A, Q2=D sin WhatsApp, Q3=B dos buckets B2).

## 10. Roadmap de sprints del módulo

| Sprint                                                  | Semana | Entregable                                              |
| ------------------------------------------------------- | ------ | ------------------------------------------------------- |
| [PANEL-01](../sprints/PANEL-01-auth-conductores.md)     | 12-13  | Hybrid + Auth + CRUD unidades + registro diario + PWA   |
| [PANEL-02](../sprints/PANEL-02-cotizaciones-recibos.md) | 14-15  | Cotizaciones + Trabajos + Recibos PDF + Verificador     |
| [PANEL-03](../sprints/PANEL-03-admin-reportes.md)       | 16-17  | SuperAdmin: usuarios, calculadora, balances, audit, CSV |

Total estimado: **6 semanas** (30 días hábiles). Después se retoma SPRINT-10
(deploy) con el VPS ya preparado para SSR, luego SPRINT-11 (QA) y SPRINT-12
(lanzamiento conjunto).

## 11. Riesgos y decisiones abiertas

| #   | Riesgo / pregunta                                                | Mitigación / decisión sugerida                                                         |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Conductor olvida cerrar el día y pierde 12h de gracia            | Recordatorio push (PWA) + SMS/WhatsApp al llegar 11:00 Lima del día N+1                |
| 2   | Desfase de reloj entre VPS y Lima                                | `TZ=America/Lima` en systemd + `ntpd` activo. Tests con timestamps fijos.              |
| 3   | Conductor sube foto mientras no tiene red                        | Service Worker con background-sync + cola local                                        |
| 4   | ¿Los recibos son comprobantes tributarios?                       | **No.** MVP = recibos internos. Comprobantes SUNAT salen del sistema actual.           |
| 5   | Retención de datos (conductor se va → su historial)              | Soft delete (`users.active=0`), datos retenidos 5 años por ley contable PE.            |
| 6   | Un gasto grande sin foto                                         | `expense_categories.requires_photo_above_cents` configurable; validación server-side.  |
| 7   | Ataque de relleno (spam items)                                   | Límite 100 ítems/día/unidad; rate-limit por usuario en `POST /api/panel/daily-entries` |
| 8   | SQLite bloqueado por concurrencia                                | `journal_mode=WAL`, `synchronous=NORMAL`. Sube techo a miles de writes/s.              |
| 9   | Contraseña por WhatsApp visible si el teléfono está comprometido | Expiración del temporal a 24h + forzar cambio en primer login.                         |
| 10  | Superadmin único que olvida la clave                             | Procedimiento documentado de reset con acceso a DB + script `scripts/reset-admin.ts`   |

## 12. Criterios de aceptación del módulo completo

- [ ] Tres roles funcionales con matriz de permisos probada
- [ ] Conductor puede registrar 1 día completo, adjuntar 1 foto, cerrar, y ver
      el registro en historial
- [ ] Cron cierra automáticamente a las 12:00 Lima
- [ ] Cotizador genera una cotización completa con calculadora y convierte en
      recibo PDF descargable
- [ ] `/verificar/[uuid]` público muestra datos correctos de un recibo válido
- [ ] SuperAdmin ve balance mes actual por unidad con filtro de periodo
- [ ] Export CSV produce archivo válido abrible en Excel
- [ ] PWA instalable en Android
- [ ] Audit log registra 100% de mutaciones de estado
- [ ] Backup se crea diario y se puede restaurar en staging
- [ ] Lighthouse PWA ≥ 90 en panel
- [ ] Sin errores de TypeScript ni ESLint

## 13. Próximos pasos tras aprobación

1. Leer [PANEL-01](../sprints/PANEL-01-auth-conductores.md) tarea por tarea.
2. Crear lista de ULIDs seed para el superadmin inicial.
3. Registrar bucket B2 `cuscomudanzas-panel` (separado del de backups).
4. Ejecutar PANEL-01 → PANEL-02 → PANEL-03 → SPRINT-10 → SPRINT-11 → SPRINT-12.
