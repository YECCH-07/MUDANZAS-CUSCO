# PANEL-01 — Auth y Registro Diario de Conductores

**Duración:** 10 días hábiles (semanas 12-13)
**Estado:** ⬜ Pendiente
**Prerrequisitos:** SPRINT-09 completado (SEO técnico).
**Documento maestro:** [docs/PANEL-INTERNO.md](../docs/PANEL-INTERNO.md)
**Alcance aprobado:** incluye 3 items P1 promovidos del backlog (§19-21):
pre-trip checklist, odómetro, múltiples viajes por día.

## Objetivo

Dejar el panel funcionando al nivel MVP para que los conductores puedan
registrar ingresos y gastos diarios desde su teléfono, con fotos, y que el
superadmin pueda crear usuarios y unidades. No incluye cotizaciones (va en
PANEL-02).

## Entregable verificable

Un conductor real puede:

1. Instalar la PWA en su Android
2. Iniciar sesión con credenciales entregadas por el admin
3. Registrar 1 flete (origen, destino, monto, foto)
4. Registrar 1 gasto (categoría, monto, foto)
5. Ver el historial de días anteriores (solo lectura si ya cerraron)
6. A las 12:00 del día siguiente, el registro queda cerrado automáticamente

## Tareas

### 1.1 — Migrar a modo híbrido

1. Instalar `@astrojs/node`.
2. `astro.config.mjs`: `output: 'hybrid'`, `adapter: node({ mode: 'standalone' })`.
3. Añadir `export const prerender = true` al frontmatter de **todas** las
   páginas actuales (`src/pages/**/*.astro` excepto futuras `panel/**`).
4. Correr `npm run build` → verificar que el output es idéntico al actual + un
   servidor Node en `dist/server/`.
5. Probar `node ./dist/server/entry.mjs` localmente → todas las páginas públicas
   deben renderizar en `:4321`.

### 1.2 — Base de datos

1. Instalar `drizzle-orm`, `drizzle-kit`, `better-sqlite3`, `@types/better-sqlite3`.
2. Crear `src/db/schema.ts` con las tablas §4 del documento maestro:
   `users`, `sessions`, `login_attempts`, `units`, `driver_assignments`,
   `daily_entries`, `entry_items`, `expense_categories`, `audit_log`.
   (Las tablas de cotizaciones van en PANEL-02.)
3. Crear `src/db/client.ts`:

   ```ts
   import Database from 'better-sqlite3';
   import { drizzle } from 'drizzle-orm/better-sqlite3';

   const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') ?? './data/panel.db');
   sqlite.pragma('journal_mode = WAL');
   sqlite.pragma('foreign_keys = ON');

   export const db = drizzle(sqlite, { schema });
   ```

4. `drizzle.config.ts` con `dialect: 'sqlite'`, `schema: './src/db/schema.ts'`,
   `out: './src/db/migrations'`.
5. Generar primera migración: `npx drizzle-kit generate`.
6. Script `scripts/migrate.mjs` que aplica migraciones pendientes al arrancar.
7. Añadir a `.gitignore`: `data/`, `*.db`, `*.db-wal`, `*.db-shm`.

### 1.3 — Autenticación con Lucia

1. Instalar `lucia`, `@lucia-auth/adapter-drizzle`, `@node-rs/argon2`.
2. `src/lib/auth/lucia.ts`: configurar Lucia con adapter Drizzle y la tabla
   `sessions`/`users`. Cookie `cm_session`, secure en producción.
3. `src/lib/auth/password.ts`: exports `hashPassword`, `verifyPassword`.
4. `src/env.d.ts`: declarar `App.Locals` con `session` y `user`.
5. `src/middleware.ts`:
   - Si `pathname` empieza con `/panel/` o `/api/panel/`:
     - Leer cookie `cm_session`, validar con Lucia
     - Si inválida → redirect `/panel/login` con `?next=<original>`
     - Si válida → setear `Astro.locals.user` y `Astro.locals.session`
   - Si `pathname === '/panel/login'` y hay sesión válida → redirect a dashboard
     por rol.
6. `src/lib/auth/rbac.ts`: mapa `{ role → pattern[] }` y función
   `canAccess(role, pathname)`.

### 1.4 — Rate limiting de login

1. `src/lib/auth/rate-limit.ts`: función `isLoginBlocked(email, ip)` que consulta
   `login_attempts` y devuelve true si hubo ≥ 5 fallos en los últimos 15 min.
2. `insertLoginAttempt(email, ip, success)` tras cada intento.
3. Cron de limpieza semanal (`DELETE FROM login_attempts WHERE at < now - 24h`).

### 1.5 — Página login

`src/pages/panel/login.astro`:

- Form `POST /api/panel/login` con `email` + `password`.
- Honeypot + origin check.
- Mensajes genéricos ("Credenciales inválidas") — no revelar qué falló.

`src/pages/api/panel/login.ts`:

- Validar con Zod: `{ email: z.string().email(), password: z.string().min(8) }`
- Chequear rate limit → si bloqueado, 429.
- Verificar password con Argon2. Si falla, registrar attempt, 401.
- Crear sesión con Lucia, setear cookie, registrar attempt success.
- Redirect a `next` o a dashboard por rol.

### 1.6 — Script de seed inicial

`scripts/seed-admin.mjs`:

- Lee `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PHONE` de `.env`.
- Genera password aleatorio (base64, 12 chars).
- Inserta usuario con `role='superadmin'` y `must_change_password=1`.
- Imprime la password en stdout **una sola vez** (nunca a disco ni logs).
- Si ya existe un superadmin, aborta.

Ejecutar: `node scripts/seed-admin.mjs`.

### 1.7 — Flujo "cambiar contraseña al primer login"

- Tras login exitoso, si `user.must_change_password`, redirect a
  `/panel/cambiar-password`.
- Formulario: password actual + nueva + confirmación (min 12 chars,
  validación con Zod).
- Al completar, `must_change_password=0`.

### 1.8 — CRUD básico de unidades (solo superadmin)

- `/panel/admin/unidades/` — listado
- `/panel/admin/unidades/nueva/` — form crear
- `/panel/admin/unidades/[id]/` — editar (placa, tonelaje, alias, SOAT, RTV,
  estado activo)

API:

- `POST /api/panel/units` → crea
- `PATCH /api/panel/units/[id]` → actualiza
- Todas las mutaciones escriben en `audit_log`.

### 1.9 — Asignación conductor ↔ unidad

- `/panel/admin/asignaciones/` — listado
- `/panel/admin/asignaciones/nueva/` — select conductor + select unidad + fecha
  inicio. Valida que no haya otra asignación vigente para la misma unidad.
- `PATCH` permite cerrar una asignación (setear `ends_at`).

### 1.10 — Catálogo de categorías de gasto

Seed inicial en la migración:

```
combustible (requires_photo_above_cents: 5000)
lavado       (null)
peaje        (5000)
alimentacion (null)
reparacion   (3000)
llantas      (3000)
frenos       (3000)
hospedaje    (5000)
otros        (5000)
```

Edición más completa en PANEL-03.

### 1.11 — Registro diario del conductor

Rutas:

- `/panel/conductor/hoy` — formulario del día activo (detecta la unidad asignada
  vigente; si tiene >1, selector)
- `/panel/conductor/historial` — lista de `daily_entries` propios, click abre
  detalle solo lectura

Formulario `/panel/conductor/hoy`:

- Tabs: "Ingresos" | "Gastos" | "Notas"
- Ingreso: monto (inputmode="numeric"), descripción, origen, destino, # personal
  (default 1), foto (opcional)
- Gasto: categoría (select), monto, descripción, foto. Si la categoría exige
  foto y el monto supera su umbral, el botón submit se deshabilita hasta
  adjuntarla.
- Lista de ítems ya cargados con opción "eliminar" (solo si el día no está
  cerrado)
- Botón "Cerrar día manualmente" — opcional, no es obligatorio porque el cron
  cierra igual.

API endpoints:

- `POST /api/panel/daily-entries/ensure` — idempotente, crea `daily_entries`
  para (unit_id, entry_date) si no existe; devuelve el id.
- `POST /api/panel/daily-entries/[id]/items` — añade ítem. Valida rol y
  autoría. Rechaza si `closed_at IS NOT NULL`.
- `DELETE /api/panel/entry-items/[id]` — elimina (mientras el día esté abierto).
- `POST /api/panel/daily-entries/[id]/close` — cierre manual.

### 1.12 — Upload de fotos a B2

1. Bucket B2 `cuscomudanzas-panel` creado con CORS permitiendo
   `https://cuscomudanzas.com`.
2. `src/lib/panel/storage.ts`:
   ```ts
   export async function getUploadUrl(
     key: string,
     contentType: string,
   ): Promise<{ url: string; fields: Record<string, string> }>;
   export function publicUrlFor(key: string): string; // URL firmada 1h para visualizar
   ```
   Usa `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, S3-compatible
   apuntando a `B2_ENDPOINT`.
3. `POST /api/panel/upload-url` → devuelve `{ url, fields, objectKey }`. El cliente
   hace `PUT` directo a B2 y al tener éxito, guarda el `objectKey` en el ítem.
4. Validaciones server-side antes de generar la presigned URL:
   - `contentType` en `['image/jpeg','image/png','image/webp']`
   - `size` ≤ 5 MB
   - Usuario es conductor y dueño del `daily_entry` referenciado
5. `photo_key` en `entry_items` se setea cuando el upload concluye.

### 1.13 — Cron de cierre diario

`src/lib/panel/cron.ts`:

```ts
import cron from 'node-cron';
// Todos los días a las 12:00:00 Lima
cron.schedule('0 12 * * *', closeYesterdayEntries, { timezone: 'America/Lima' });
```

`closeYesterdayEntries()`:

- Calcula `yesterday = today - 1d` en zona Lima
- `UPDATE daily_entries SET closed_at = ? WHERE entry_date <= ? AND closed_at IS NULL`
- Por cada fila afectada, escribe `audit_log('entry.auto_close', ...)`
- Log estructurado a stdout (captado por systemd-journald)

El cron se registra al arrancar el servidor (`dist/server/entry.mjs`) mediante
`integrations` o un hook de Astro.

### 1.14 — PWA (instalable + offline básico)

1. Instalar `@vite-pwa/astro`.
2. `astro.config.mjs`: integración con:
   ```js
   VitePWA({
     registerType: 'autoUpdate',
     scope: '/panel/',
     srcDir: 'src',
     filename: 'sw.ts',
     manifest: {
       name: 'Expresos Ñan — Panel',
       short_name: 'Ñan Panel',
       theme_color: '#E40414',
       background_color: '#0F0F0F',
       display: 'standalone',
       start_url: '/panel/',
       scope: '/panel/',
       icons: [
         /* 192, 512 */
       ],
     },
     workbox: {
       globPatterns: ['**/*.{js,css,html,svg,woff2}'],
       navigateFallbackDenylist: [/\/api\//],
       runtimeCaching: [
         {
           urlPattern: /\/api\/panel\//,
           handler: 'NetworkOnly',
           options: {
             backgroundSync: { name: 'panel-queue', options: { maxRetentionTime: 24 * 60 } },
           },
         },
       ],
     },
   });
   ```
3. Generar iconos 192/512 del logo Ñan-2.png.
4. Badge visible "Sin conexión" cuando `navigator.onLine === false`.

### 1.15 — Dashboard inicial por rol

`/panel/` (ruta raíz del panel) redirige según `user.role`:

- `superadmin` → `/panel/admin/`
- `cotizador` → `/panel/cotizador/` (placeholder hasta PANEL-02)
- `conductor` → `/panel/conductor/hoy/`

### 1.16 — Audit log mínimo

`src/lib/panel/audit.ts`:

```ts
export async function logAudit(
  ctx: APIContext,
  action: string,
  target?: string,
  diff?: unknown,
): Promise<void>;
```

Llamar desde cada API de mutación. IP desde `ctx.clientAddress`.

### 1.17 — Logout

`/api/panel/logout` (POST) → destruye la sesión de Lucia + limpia cookie.
Enlace "Salir" en el layout del panel.

### 1.18 — [P1 2.4/2.5 no aplican en este sprint; ver PANEL-02]

(Placeholder de numeración para mantener consistencia con backlog.)

### 1.19 — Pre-trip checklist (P1 item 1.4)

Tabla nueva `pre_trip_checks` definida en PANEL-INTERNO.md §4.3.

1. Catálogo fijo de ítems del checklist (editable por admin en PANEL-03, pero
   seed inicial ya útil):
   - Presión y estado de llantas (incluye repuesto)
   - Luces (altas, bajas, direccionales, freno)
   - Frenos responden correctamente
   - Nivel de combustible visible
   - Mantas operativas: cuenta mínima 6
   - Correas: cuenta mínima 4
   - Carretilla
   - SOAT vigente (referencia a `unit_documents`)
   - Tarjeta de propiedad a bordo
   - Botiquín y triángulos
2. Ruta `/panel/conductor/pre-trip/` — se muestra automáticamente antes de
   abrir el formulario del día si no existe un `pre_trip_checks` para
   (unit_id, entry_date=hoy).
3. Cada ítem: radio `ok` | `fail` | `na`. Si `fail` → campo nota obligatorio.
4. Foto opcional general del estado del camión.
5. Ítems críticos (llantas, luces, frenos, SOAT vigente) en `fail` → setea
   `blocker=1` y el formulario de registro del día queda **bloqueado con un
   banner rojo "Unidad no operativa — avisa al admin antes de salir"**. El
   conductor no puede registrar viajes hasta que admin marque `blocker=0`
   desde `/panel/admin/unidades/[id]/` con un comentario (ej: "reparado en
   taller X, puede salir").
6. API: `POST /api/panel/pre-trip/create`, `POST /api/panel/pre-trip/[id]/unblock`
   (solo superadmin). Validar con Zod.
7. Trigger en `daily_entries.INSERT`: si no hay `pre_trip_checks` del día,
   rechazar.

### 1.20 — Odómetro inicial/final (P1 item 1.5)

Añadir campos `odometer_start_km` y `odometer_end_km` a `daily_entries` (ya
definidos en PANEL-INTERNO.md §4.3).

1. En `/panel/conductor/hoy/` añadir:
   - Al inicio: campo "Kilometraje actual" obligatorio antes del primer viaje
     del día (inputmode numérico). Se guarda como `odometer_start_km`.
   - Al cerrar: campo "Kilometraje final" obligatorio antes del cierre
     manual. Se guarda como `odometer_end_km`.
2. Validaciones:
   - `odometer_start_km ≥ odometer del día anterior cerrado para la misma unidad`
     (continuidad; pequeña tolerancia ±2 km para errores de lectura).
   - `odometer_end_km ≥ odometer_start_km`.
3. Vista histórico: mostrar `km_recorridos = end - start` del día.
4. Endpoint reporte: `GET /api/panel/units/[id]/km-totals?from=&to=` devuelve
   suma de km recorridos (base para eficiencia de combustible en fase 2).

### 1.21 — Múltiples viajes por día con hora inicio/fin (P1 item 1.6)

Tabla nueva `trips` definida en PANEL-INTERNO.md §4.3.

1. En `/panel/conductor/hoy/` añadir tab "Viajes" (antes del tab Gastos).
2. Botón "Nuevo viaje" abre modal con:
   - Tipo de servicio (select): flete / mudanza / embalaje / armado /
     taxi carga / otro
   - Origen, destino (text)
   - Número de personal (default 1)
   - Monto cobrado (requerido al cerrar, opcional al iniciar)
   - Cliente (text libre para registros rápidos; en PANEL-02 se puede
     convertir en lookup a tabla `customers`)
   - Notas
3. Botón "Iniciar viaje" crea fila con `started_at=now()`, `ended_at=NULL`.
4. Viaje activo visible en banner permanente: "Viaje en curso: San Sebastián →
   San Jerónimo, 00:42 transcurridos".
5. Botón "Finalizar viaje" captura `ended_at=now()` y pide confirmación del
   monto cobrado. Actualiza fila.
6. Un viaje no puede iniciar si hay otro sin cerrar (serialización).
7. Los `entry_items` de gastos ahora pueden opcionalmente ligarse a un viaje
   en curso/reciente (`trip_id`), útil para combustible durante un viaje
   largo.
8. Listado del día muestra viajes con duración y monto. El total de ingresos
   del día ahora se calcula como `SUM(trips.amount_cents) +
SUM(entry_items WHERE kind='income')`.
9. API: `POST /api/panel/trips/start`, `POST /api/panel/trips/[id]/end`,
   `PATCH /api/panel/trips/[id]`, `DELETE /api/panel/trips/[id]` (solo si día
   abierto).

### 1.22 — Tests de humo

- `vitest` o `node --test`:
  - Password hash + verify
  - Crear daily_entry idempotente
  - Rechazar item si día cerrado
  - Calcular `entry_date` correcto para viaje nocturno (sale 23:00 Lunes)
- Test manual documentado en `docs/PANEL-QA-MANUAL.md`:
  - Login exitoso/fallido
  - Upload de foto con red intermitente
  - Cierre automático a las 12:00

## Configuración de entorno

En `.env.development`:

```bash
DATABASE_URL=file:./data/panel.db
SESSION_COOKIE_SECURE=false
B2_KEY_ID=...
B2_APPLICATION_KEY=...
B2_BUCKET_FOTOS=cuscomudanzas-panel-fotos-dev
B2_BUCKET_DOCS=cuscomudanzas-panel-docs-dev
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
SITE_URL=http://localhost:4321
TZ=America/Lima
# SMTP Gmail (ver PANEL-INTERNO.md §3.5)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<correo-operativo>@gmail.com
SMTP_PASSWORD=<app-password>
```

`.env.production` equivalente con `SESSION_COOKIE_SECURE=true`,
`SITE_URL=https://cuscomudanzas.com` y buckets sin sufijo `-dev`.

## Criterios de aceptación

- [ ] `npm run build` produce output híbrido sin warnings
- [ ] Todas las páginas públicas existentes siguen siendo pre-renderizadas
- [ ] Login con rate limit funcionando
- [ ] Superadmin puede crear conductores y asignarles unidades
- [ ] Conductor registra 1 ingreso + 1 gasto con foto en < 30 segundos
- [ ] Foto se ve al abrir el historial
- [ ] Cron cierra registros a las 12:00 Lima (probado con reloj falseado)
- [ ] PWA instalable en Chrome Android
- [ ] Offline: formulario se guarda local, se envía al volver la red
- [ ] Ningún dato financiero aparece en los logs
- [ ] 100% de mutaciones escriben `audit_log`
- [ ] ESLint + TypeScript limpios
- [ ] **Pre-trip checklist** bloquea el formulario si ítem crítico falla (P1)
- [ ] **Odómetro inicial/final** obligatorio y consistente entre días (P1)
- [ ] **Múltiples viajes/día** con hora inicio/fin y monto por viaje (P1)
- [ ] Banner de viaje activo persistente durante el día (P1)

## Siguiente sprint

**[PANEL-02 — Cotizaciones y Recibos](PANEL-02-cotizaciones-recibos.md)**
