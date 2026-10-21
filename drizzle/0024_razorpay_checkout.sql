CREATE TYPE "public"."gateway_payment_status" AS ENUM('pending', 'paid');--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_status" "gateway_payment_status";--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "razorpay_order_id" varchar(255);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "razorpay_payment_id" varchar(255);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "razorpay_signature" varchar(64);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_amount" integer;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_currency" varchar(3);--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "checkout_token_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_razorpay_order_id_unique" UNIQUE("razorpay_order_id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_razorpay_payment_id_unique" UNIQUE("razorpay_payment_id");--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_checkout_token_hash_unique" UNIQUE("checkout_token_hash");