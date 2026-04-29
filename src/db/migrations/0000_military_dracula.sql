CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`target` text,
	`diff_json` text,
	`ip` text,
	`at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_log_at_idx` ON `audit_log` (`at`);--> statement-breakpoint
CREATE INDEX `audit_log_user_idx` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE TABLE `daily_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`driver_id` text NOT NULL,
	`entry_date` text NOT NULL,
	`odometer_start_km` integer,
	`odometer_end_km` integer,
	`pre_trip_check_id` text,
	`closed_at` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pre_trip_check_id`) REFERENCES `pre_trip_checks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_entries_unit_date_idx` ON `daily_entries` (`unit_id`,`entry_date`);--> statement-breakpoint
CREATE TABLE `driver_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`unit_id` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `driver_assignments_user_unit_idx` ON `driver_assignments` (`user_id`,`unit_id`);--> statement-breakpoint
CREATE TABLE `entry_items` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`trip_id` text,
	`kind` text NOT NULL,
	`category_id` text,
	`amount_cents` integer NOT NULL,
	`description` text NOT NULL,
	`occurred_at` text NOT NULL,
	`photo_key` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `daily_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `entry_items_entry_idx` ON `entry_items` (`entry_id`);--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`label_es` text NOT NULL,
	`requires_photo_above_cents` integer,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expense_categories_slug_idx` ON `expense_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`ip` text,
	`at` integer NOT NULL,
	`success` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_attempts_email_at_idx` ON `login_attempts` (`email`,`at`);--> statement-breakpoint
CREATE TABLE `pre_trip_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`unit_id` text NOT NULL,
	`driver_id` text NOT NULL,
	`entry_date` text NOT NULL,
	`items_json` text NOT NULL,
	`blocker` integer DEFAULT false NOT NULL,
	`blocker_cleared_by` text,
	`blocker_clear_note` text,
	`photo_key` text,
	`signed_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`blocker_cleared_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pre_trip_unit_date_idx` ON `pre_trip_checks` (`unit_id`,`entry_date`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`ip` text,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`service_kind` text NOT NULL,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`crew_size` integer DEFAULT 1 NOT NULL,
	`customer_name` text,
	`job_id` text,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `daily_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trips_entry_idx` ON `trips` (`entry_id`);--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`plate` text NOT NULL,
	`tonnage` integer NOT NULL,
	`alias` text,
	`soat_expires` text,
	`rtv_expires` text,
	`next_service_km` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `units_plate_idx` ON `units` (`plate`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text NOT NULL,
	`password_hash` text NOT NULL,
	`phone` text,
	`active` integer DEFAULT true NOT NULL,
	`must_change_password` integer DEFAULT false NOT NULL,
	`temp_password_expires_at` text,
	`totp_secret` text,
	`totp_enabled` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);