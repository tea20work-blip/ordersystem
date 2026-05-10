ALTER TABLE "order" ADD COLUMN "paid_online" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "paid_cash" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "lending_amount" integer DEFAULT 0;