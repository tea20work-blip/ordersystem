ALTER TYPE "public"."order_status" ADD VALUE 'paid_online';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'paid_cash';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'paid_user';--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "is_out_of_stock" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "is_hidden" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "is_running" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "lending_user_id" integer;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "lending_amount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_lending_user_id_user_id_fk" FOREIGN KEY ("lending_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;