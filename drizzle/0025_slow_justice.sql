CREATE TYPE "public"."dish_type" AS ENUM('food', 'beverage', 'combo');--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "dish_type" "dish_type" DEFAULT 'food' NOT NULL;