/*
 * Schema Drizzle del panel interno.
 * Ver especificación completa en docs/PANEL-INTERNO.md §4.
 *
 * Convenciones:
 *  - `id` siempre ULID (TEXT) generado por la app.
 *  - Timestamps TEXT ISO-8601 en UTC (se convierten a hora Lima en la UI).
 *  - Montos en céntimos (INTEGER) para evitar errores de punto flotante.
 *  - Foreign keys con ON DELETE apropiado; cascadas explícitas donde corresponde.
 */
import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// Autenticación y usuarios
// ============================================================================

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    role: text('role', { enum: ['superadmin', 'cotizador', 'conductor'] }).notNull(),
    passwordHash: text('password_hash').notNull(),
    phone: text('phone'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    mustChangePassword: integer('must_change_password', { mode: 'boolean' })
      .notNull()
      .default(false),
    tempPasswordExpiresAt: text('temp_password_expires_at'), // P1 item 10.10
    totpSecret: text('totp_secret'),
    totpEnabled: integer('totp_enabled', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
);

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(), // Unix epoch ms
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  ip: text('ip'),
  userAgent: text('user_agent'),
});

export const loginAttempts = sqliteTable(
  'login_attempts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email'),
    ip: text('ip'),
    at: integer('at').notNull(), // Unix epoch ms
    success: integer('success', { mode: 'boolean' }).notNull(),
  },
  (table) => [index('login_attempts_email_at_idx').on(table.email, table.at)],
);

// ============================================================================
// Unidades y asignaciones
// ============================================================================

export const units = sqliteTable(
  'units',
  {
    id: text('id').primaryKey(),
    plate: text('plate').notNull(),
    tonnage: integer('tonnage').notNull(), // 1, 2 o 4
    alias: text('alias'),
    soatExpires: text('soat_expires'), // yyyy-mm-dd
    rtvExpires: text('rtv_expires'),
    nextServiceKm: integer('next_service_km'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [uniqueIndex('units_plate_idx').on(table.plate)],
);

export const driverAssignments = sqliteTable(
  'driver_assignments',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    unitId: text('unit_id')
      .notNull()
      .references(() => units.id),
    startsAt: text('starts_at').notNull(), // yyyy-mm-dd
    endsAt: text('ends_at'), // NULL = vigente
  },
  (table) => [index('driver_assignments_user_unit_idx').on(table.userId, table.unitId)],
);

// ============================================================================
// Registro diario: pre-trip + daily entries + trips + entry items
// ============================================================================

// P1 item 1.4 — checklist pre-viaje
export const preTripChecks = sqliteTable(
  'pre_trip_checks',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id')
      .notNull()
      .references(() => units.id),
    driverId: text('driver_id')
      .notNull()
      .references(() => users.id),
    entryDate: text('entry_date').notNull(), // yyyy-mm-dd Lima
    itemsJson: text('items_json').notNull(), // JSON: [{label, status:'ok|fail|na', note}]
    blocker: integer('blocker', { mode: 'boolean' }).notNull().default(false),
    blockerClearedBy: text('blocker_cleared_by').references(() => users.id),
    blockerClearNote: text('blocker_clear_note'),
    photoKey: text('photo_key'), // bucket fotos
    signedAt: text('signed_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [uniqueIndex('pre_trip_unit_date_idx').on(table.unitId, table.entryDate)],
);

export const dailyEntries = sqliteTable(
  'daily_entries',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id')
      .notNull()
      .references(() => units.id),
    driverId: text('driver_id')
      .notNull()
      .references(() => users.id),
    entryDate: text('entry_date').notNull(), // yyyy-mm-dd Lima (día de salida)
    odometerStartKm: integer('odometer_start_km'), // P1 item 1.5
    odometerEndKm: integer('odometer_end_km'),
    preTripCheckId: text('pre_trip_check_id').references(() => preTripChecks.id),
    closedAt: text('closed_at'),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [uniqueIndex('daily_entries_unit_date_idx').on(table.unitId, table.entryDate)],
);

// P1 item 1.6 — múltiples viajes por día
export const trips = sqliteTable(
  'trips',
  {
    id: text('id').primaryKey(),
    entryId: text('entry_id')
      .notNull()
      .references(() => dailyEntries.id, { onDelete: 'cascade' }),
    serviceKind: text('service_kind', {
      enum: ['flete', 'mudanza', 'embalaje', 'armado', 'taxi_carga', 'otro'],
    }).notNull(),
    origin: text('origin').notNull(),
    destination: text('destination').notNull(),
    startedAt: text('started_at').notNull(),
    endedAt: text('ended_at'),
    crewSize: integer('crew_size').notNull().default(1),
    customerName: text('customer_name'), // texto libre por ahora
    jobId: text('job_id'), // FK a jobs (PANEL-02) — sin ref formal aún
    amountCents: integer('amount_cents').notNull().default(0),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('trips_entry_idx').on(table.entryId)],
);

export const expenseCategories = sqliteTable(
  'expense_categories',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    labelEs: text('label_es').notNull(),
    requiresPhotoAboveCents: integer('requires_photo_above_cents'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [uniqueIndex('expense_categories_slug_idx').on(table.slug)],
);

export const entryItems = sqliteTable(
  'entry_items',
  {
    id: text('id').primaryKey(),
    entryId: text('entry_id')
      .notNull()
      .references(() => dailyEntries.id, { onDelete: 'cascade' }),
    tripId: text('trip_id').references(() => trips.id),
    kind: text('kind', { enum: ['income', 'expense'] }).notNull(),
    categoryId: text('category_id').references(() => expenseCategories.id),
    amountCents: integer('amount_cents').notNull(),
    description: text('description').notNull(),
    occurredAt: text('occurred_at').notNull(),
    photoKey: text('photo_key'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('entry_items_entry_idx').on(table.entryId)],
);

// ============================================================================
// Audit log
// ============================================================================

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id),
    action: text('action').notNull(),
    target: text('target'),
    diffJson: text('diff_json'),
    ip: text('ip'),
    at: text('at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('audit_log_at_idx').on(table.at), index('audit_log_user_idx').on(table.userId)],
);

// ============================================================================
// PANEL-02: Cotizaciones, trabajos y recibos
// ============================================================================

export const customers = sqliteTable(
  'customers',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    phone: text('phone'),
    email: text('email'),
    docType: text('doc_type', { enum: ['DNI', 'RUC', 'CE', 'Pasaporte'] }),
    docNumber: text('doc_number'),
    tagsJson: text('tags_json').notNull().default('[]'), // P1 item 5.2
    blacklisted: integer('blacklisted', { mode: 'boolean' }).notNull().default(false),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    index('customers_phone_idx').on(table.phone),
    index('customers_name_idx').on(table.name),
  ],
);

// P1 item 2.4: plantillas de servicios frecuentes
export const quoteTemplates = sqliteTable('quote_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  serviceType: text('service_type').notNull(),
  defaultFields: text('default_fields').notNull().default('{}'),
  defaultItems: text('default_items').notNull().default('[]'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const quotes = sqliteTable(
  'quotes',
  {
    id: text('id').primaryKey(),
    number: text('number').notNull(),
    customerId: text('customer_id')
      .notNull()
      .references(() => customers.id),
    serviceType: text('service_type', {
      enum: [
        'flete',
        'mudanza_personal',
        'mudanza_embalaje',
        'embalaje_solo',
        'armado_desarmado',
        'almacenaje',
        'solo_vehiculo_personal',
        'otro',
      ],
    }).notNull(),
    templateId: text('template_id').references(() => quoteTemplates.id),
    leadSource: text('lead_source', {
      enum: ['whatsapp', 'google', 'referido', 'walk-in', 'recurrente', 'otro'],
    }),
    origin: text('origin'),
    destination: text('destination'),
    tentativeDate: text('tentative_date'),
    volumeM3: integer('volume_m3'),
    distanceKm: integer('distance_km'),
    floorsOrigin: integer('floors_origin'),
    floorsDest: integer('floors_dest'),
    hasElevator: integer('has_elevator', { mode: 'boolean' }).default(false),
    crewSize: integer('crew_size').default(2),
    totalCents: integer('total_cents').notNull(),
    usedCalculator: integer('used_calculator', { mode: 'boolean' }).notNull().default(false),
    /**
     * Si true, los precios mostrados ya incluyen IGV (18%).
     * Si false, el PDF lo aclara y el cliente debe agregar 18% al monto.
     */
    includesIgv: integer('includes_igv', { mode: 'boolean' }).notNull().default(true),
    status: text('status', {
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'completed', 'canceled'],
    })
      .notNull()
      .default('draft'),
    expiresAt: text('expires_at'), // P1 item 2.7
    rejectionReason: text('rejection_reason', {
      enum: ['precio', 'fecha', 'competidor', 'sin-respuesta', 'otro'],
    }),
    rejectionNote: text('rejection_note'),
    notes: text('notes'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    uniqueIndex('quotes_number_idx').on(table.number),
    index('quotes_customer_idx').on(table.customerId),
    index('quotes_status_idx').on(table.status),
  ],
);

export const quoteItems = sqliteTable(
  'quote_items',
  {
    id: text('id').primaryKey(),
    quoteId: text('quote_id')
      .notNull()
      .references(() => quotes.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    amountCents: integer('amount_cents').notNull(),
    orderIdx: integer('order_idx').notNull(),
  },
  (table) => [index('quote_items_quote_idx').on(table.quoteId)],
);

export const jobs = sqliteTable(
  'jobs',
  {
    id: text('id').primaryKey(),
    quoteId: text('quote_id')
      .notNull()
      .references(() => quotes.id),
    assignedUnitId: text('assigned_unit_id').references(() => units.id),
    assignedDriverId: text('assigned_driver_id').references(() => users.id),
    scheduledDate: text('scheduled_date'),
    status: text('status', {
      enum: ['scheduled', 'in_progress', 'completed', 'canceled'],
    })
      .notNull()
      .default('scheduled'),
    completedAt: text('completed_at'),
    notes: text('notes'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('jobs_quote_idx').on(table.quoteId), index('jobs_status_idx').on(table.status)],
);

export const receipts = sqliteTable(
  'receipts',
  {
    id: text('id').primaryKey(),
    uuid: text('uuid').notNull(),
    number: text('number').notNull(),
    quoteId: text('quote_id').references(() => quotes.id),
    jobId: text('job_id').references(() => jobs.id),
    customerId: text('customer_id')
      .notNull()
      .references(() => customers.id),
    totalCents: integer('total_cents').notNull(),
    paymentMethod: text('payment_method', {
      enum: ['efectivo', 'transferencia', 'yape', 'plin', 'otro'],
    }).notNull(),
    docKind: text('doc_kind', { enum: ['recibo', 'boleta_ref', 'factura_ref'] })
      .notNull()
      .default('recibo'),
    requiresSunatInvoice: integer('requires_sunat_invoice', { mode: 'boolean' })
      .notNull()
      .default(false),
    includesIgv: integer('includes_igv', { mode: 'boolean' }).notNull().default(true),
    pdfKey: text('pdf_key'), // B2 docs bucket
    issuedBy: text('issued_by')
      .notNull()
      .references(() => users.id),
    issuedAt: text('issued_at').notNull(),
    voidedAt: text('voided_at'),
    voidReason: text('void_reason'),
  },
  (table) => [
    uniqueIndex('receipts_uuid_idx').on(table.uuid),
    uniqueIndex('receipts_number_idx').on(table.number),
  ],
);

// Configuración de calculadora (singleton id='current').
export const calcConfig = sqliteTable('calc_config', {
  id: text('id').primaryKey().default('current'),
  rulesJson: text('rules_json').notNull(),
  updatedBy: text('updated_by').references(() => users.id),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Counters para numeración secuencial (COT-2026-0001, REC-2026-0001).
export const counters = sqliteTable('counters', {
  year: integer('year').notNull(),
  kind: text('kind', { enum: ['quote', 'receipt'] }).notNull(),
  value: integer('value').notNull().default(0),
});

// ============================================================================
// PANEL-03: Admin / reportes / mantenimiento / vault de documentos
// ============================================================================

// P1 item 3.3: gastos imputables a un job (P&L por job).
export const jobCosts = sqliteTable(
  'job_costs',
  {
    id: text('id').primaryKey(),
    jobId: text('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    categoryId: text('category_id').references(() => expenseCategories.id),
    amountCents: integer('amount_cents').notNull(),
    description: text('description').notNull(),
    photoKey: text('photo_key'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('job_costs_job_idx').on(table.jobId)],
);

// P1 item 3.5: caja chica.
export const pettyCashAccounts = sqliteTable(
  'petty_cash_accounts',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    balanceCents: integer('balance_cents').notNull().default(0),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [uniqueIndex('petty_cash_name_idx').on(table.name)],
);

export const pettyCashEntries = sqliteTable(
  'petty_cash_entries',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id')
      .notNull()
      .references(() => pettyCashAccounts.id),
    direction: text('direction', { enum: ['in', 'out'] }).notNull(),
    amountCents: integer('amount_cents').notNull(),
    reason: text('reason').notNull(),
    linkedEntryItemId: text('linked_entry_item_id').references(() => entryItems.id),
    linkedReceiptId: text('linked_receipt_id').references(() => receipts.id),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('petty_cash_account_idx').on(table.accountId)],
);

// P1 items 4.2 y 4.3: document vault.
export const unitDocuments = sqliteTable(
  'unit_documents',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    kind: text('kind', {
      enum: ['soat', 'rtv', 'tarjeta_propiedad', 'seguro', 'poliza', 'otro'],
    }).notNull(),
    fileKey: text('file_key').notNull(),
    validUntil: text('valid_until'),
    notes: text('notes'),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => users.id),
    uploadedAt: text('uploaded_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('unit_docs_unit_idx').on(table.unitId)],
);

export const driverDocuments = sqliteTable(
  'driver_documents',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind', {
      enum: ['licencia', 'dni', 'record_policial', 'certificado_medico', 'contrato', 'otro'],
    }).notNull(),
    fileKey: text('file_key').notNull(),
    validUntil: text('valid_until'),
    notes: text('notes'),
    uploadedBy: text('uploaded_by')
      .notNull()
      .references(() => users.id),
    uploadedAt: text('uploaded_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('driver_docs_user_idx').on(table.userId)],
);

// P1 items 12.1-12.2: estado de vía colaborativo.
export const routeStatusReports = sqliteTable(
  'route_status_reports',
  {
    id: text('id').primaryKey(),
    routeSlug: text('route_slug').notNull(),
    status: text('status', { enum: ['ok', 'bloqueada', 'precaucion', 'desvio'] }).notNull(),
    note: text('note').notNull(),
    reportedBy: text('reported_by')
      .notNull()
      .references(() => users.id),
    reportedAt: text('reported_at')
      .notNull()
      .default(sql`(datetime('now'))`),
    expiresAt: text('expires_at'),
  },
  (table) => [index('route_status_route_idx').on(table.routeSlug)],
);

// P1 item 8.5: import jobs (auditoría de cargas Excel).
export const importJobs = sqliteTable('import_jobs', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  fileName: text('file_name').notNull(),
  rowsTotal: integer('rows_total').notNull(),
  rowsOk: integer('rows_ok').notNull(),
  rowsFailed: integer('rows_failed').notNull(),
  errorsJson: text('errors_json'),
  importedBy: text('imported_by')
    .notNull()
    .references(() => users.id),
  importedAt: text('imported_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Mantenimiento de unidades.
export const maintenanceRecords = sqliteTable(
  'maintenance_records',
  {
    id: text('id').primaryKey(),
    unitId: text('unit_id')
      .notNull()
      .references(() => units.id, { onDelete: 'cascade' }),
    occurredAt: text('occurred_at').notNull(),
    km: integer('km'),
    kind: text('kind').notNull(),
    amountCents: integer('amount_cents').notNull(),
    shop: text('shop'),
    notes: text('notes'),
    invoiceKey: text('invoice_key'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index('maintenance_unit_idx').on(table.unitId)],
);

// ============================================================================
// Tipos exportados para uso en la app
// ============================================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type DriverAssignment = typeof driverAssignments.$inferSelect;
export type PreTripCheck = typeof preTripChecks.$inferSelect;
export type DailyEntry = typeof dailyEntries.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type EntryItem = typeof entryItems.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;

export type Customer = typeof customers.$inferSelect;
export type QuoteTemplate = typeof quoteTemplates.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Receipt = typeof receipts.$inferSelect;
export type CalcConfig = typeof calcConfig.$inferSelect;
export type JobCost = typeof jobCosts.$inferSelect;
export type PettyCashAccount = typeof pettyCashAccounts.$inferSelect;
export type PettyCashEntry = typeof pettyCashEntries.$inferSelect;
export type UnitDocument = typeof unitDocuments.$inferSelect;
export type DriverDocument = typeof driverDocuments.$inferSelect;
export type RouteStatusReport = typeof routeStatusReports.$inferSelect;
export type ImportJob = typeof importJobs.$inferSelect;
export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;

export type UserRole = User['role'];
export type QuoteStatus = Quote['status'];
export type ServiceType = Quote['serviceType'];
export type LeadSource = NonNullable<Quote['leadSource']>;
export type RejectionReason = NonNullable<Quote['rejectionReason']>;
export type JobStatus = Job['status'];
export type PaymentMethod = Receipt['paymentMethod'];
