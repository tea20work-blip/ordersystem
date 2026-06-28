CREATE TYPE "public"."order_type" AS ENUM('dine_in', 'take_away', 'delivery');--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "order_type" "order_type" DEFAULT 'dine_in';