ALTER TABLE "order_item" DROP CONSTRAINT "order_item_dish_id_dish_id_fk";
--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "dish_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "dish_image_url" varchar(255);--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_dish_id_dish_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dish"("id") ON DELETE set null ON UPDATE no action;