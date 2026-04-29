-- Añade flag includes_igv a quotes y receipts.
-- 1 = los precios mostrados ya incluyen IGV (default, comportamiento actual).
-- 0 = los precios NO incluyen IGV; la nota legal del PDF lo aclara.
ALTER TABLE `quotes` ADD COLUMN `includes_igv` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE `receipts` ADD COLUMN `includes_igv` integer DEFAULT 1 NOT NULL;
