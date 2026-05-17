ALTER TABLE "table" ADD COLUMN "table_code" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "table" ADD CONSTRAINT "table_table_code_unique" UNIQUE("table_code");