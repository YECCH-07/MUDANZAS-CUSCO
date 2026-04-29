CREATE TABLE `driver_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`file_key` text NOT NULL,
	`valid_until` text,
	`notes` text,
	`uploaded_by` text NOT NULL,
	`uploaded_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `driver_docs_user_idx` ON `driver_documents` (`user_id`);--> statement-breakpoint
CREATE TABLE `import_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`file_name` text NOT NULL,
	`rows_total` integer NOT NULL,
	`rows_ok` integer NOT NULL,
	`rows_failed` integer NOT NULL,
	`errors_json` text,
	`imported_by` text NOT NULL,
	`imported_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`imported_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `job_costs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`category_id` text,
	`amount_cents` integer NOT NULL,
	`description` text NOT NULL,
	`photo_key` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `job_costs_job_idx` ON `job_costs` (`job_id`);--> statement-breakpoint
CREATE TABLE `maintenance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`occurred_at` text NOT NULL,
	`km` integer,
	`kind` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`shop` text,
	`notes` text,
	`invoice_key` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `maintenance_unit_idx` ON `maintenance_records` (`unit_id`);--> statement-breakpoint
CREATE TABLE `petty_cash_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`balance_cents` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `petty_cash_name_idx` ON `petty_cash_accounts` (`name`);--> statement-breakpoint
CREATE TABLE `petty_cash_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`direction` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`reason` text NOT NULL,
	`linked_entry_item_id` text,
	`linked_receipt_id` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `petty_cash_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linked_entry_item_id`) REFERENCES `entry_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`linked_receipt_id`) REFERENCES `receipts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `petty_cash_account_idx` ON `petty_cash_entries` (`account_id`);--> statement-breakpoint
CREATE TABLE `route_status_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`route_slug` text NOT NULL,
	`status` text NOT NULL,
	`note` text NOT NULL,
	`reported_by` text NOT NULL,
	`reported_at` text DEFAULT (datetime('now')) NOT NULL,
	`expires_at` text,
	FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `route_status_route_idx` ON `route_status_reports` (`route_slug`);--> statement-breakpoint
CREATE TABLE `unit_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`kind` text NOT NULL,
	`file_key` text NOT NULL,
	`valid_until` text,
	`notes` text,
	`uploaded_by` text NOT NULL,
	`uploaded_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `unit_docs_unit_idx` ON `unit_documents` (`unit_id`);