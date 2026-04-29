CREATE TABLE `calc_config` (
	`id` text PRIMARY KEY DEFAULT 'current' NOT NULL,
	`rules_json` text NOT NULL,
	`updated_by` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `counters` (
	`year` integer NOT NULL,
	`kind` text NOT NULL,
	`value` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`doc_type` text,
	`doc_number` text,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`blacklisted` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `customers_phone_idx` ON `customers` (`phone`);--> statement-breakpoint
CREATE INDEX `customers_name_idx` ON `customers` (`name`);--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`assigned_unit_id` text,
	`assigned_driver_id` text,
	`scheduled_date` text,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`completed_at` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_driver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `jobs_quote_idx` ON `jobs` (`quote_id`);--> statement-breakpoint
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`);--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`label` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`order_idx` integer NOT NULL,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quote_items_quote_idx` ON `quote_items` (`quote_id`);--> statement-breakpoint
CREATE TABLE `quote_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`service_type` text NOT NULL,
	`default_fields` text DEFAULT '{}' NOT NULL,
	`default_items` text DEFAULT '[]' NOT NULL,
	`created_by` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`customer_id` text NOT NULL,
	`service_type` text NOT NULL,
	`template_id` text,
	`lead_source` text,
	`origin` text,
	`destination` text,
	`tentative_date` text,
	`volume_m3` integer,
	`distance_km` integer,
	`floors_origin` integer,
	`floors_dest` integer,
	`has_elevator` integer DEFAULT false,
	`crew_size` integer DEFAULT 2,
	`total_cents` integer NOT NULL,
	`used_calculator` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`expires_at` text,
	`rejection_reason` text,
	`rejection_note` text,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_id`) REFERENCES `quote_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_number_idx` ON `quotes` (`number`);--> statement-breakpoint
CREATE INDEX `quotes_customer_idx` ON `quotes` (`customer_id`);--> statement-breakpoint
CREATE INDEX `quotes_status_idx` ON `quotes` (`status`);--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`uuid` text NOT NULL,
	`number` text NOT NULL,
	`quote_id` text,
	`job_id` text,
	`customer_id` text NOT NULL,
	`total_cents` integer NOT NULL,
	`payment_method` text NOT NULL,
	`doc_kind` text DEFAULT 'recibo' NOT NULL,
	`requires_sunat_invoice` integer DEFAULT false NOT NULL,
	`pdf_key` text,
	`issued_by` text NOT NULL,
	`issued_at` text NOT NULL,
	`voided_at` text,
	`void_reason` text,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receipts_uuid_idx` ON `receipts` (`uuid`);--> statement-breakpoint
CREATE UNIQUE INDEX `receipts_number_idx` ON `receipts` (`number`);