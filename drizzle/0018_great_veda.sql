ALTER TABLE "addons" DROP CONSTRAINT "addons_dish_id_dish_id_fk";
--> statement-breakpoint
ALTER TABLE "addons" DROP CONSTRAINT "addons_add_on_id_dish_id_fk";
--> statement-breakpoint
ALTER TABLE "cigarette_orders" DROP CONSTRAINT "cigarette_orders_cigarette_id_cigarette_id_fk";
--> statement-breakpoint
ALTER TABLE "cigarette_orders" DROP CONSTRAINT "cigarette_orders_table_id_table_id_fk";
--> statement-breakpoint
ALTER TABLE "cigarette_orders" DROP CONSTRAINT "cigarette_orders_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "dish_category" DROP CONSTRAINT "dish_category_dish_id_dish_id_fk";
--> statement-breakpoint
ALTER TABLE "dish_category" DROP CONSTRAINT "dish_category_category_id_category_id_fk";
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_table_id_table_id_fk";
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_lending_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_order_id_order_id_fk";
--> statement-breakpoint
ALTER TABLE "recommended_dishes" DROP CONSTRAINT "recommended_dishes_dish_id_dish_id_fk";
--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_dish_id_dish_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dish"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_add_on_id_dish_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."dish"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cigarette_orders" ADD CONSTRAINT "cigarette_orders_cigarette_id_cigarette_id_fk" FOREIGN KEY ("cigarette_id") REFERENCES "public"."cigarette"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cigarette_orders" ADD CONSTRAINT "cigarette_orders_table_id_table_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cigarette_orders" ADD CONSTRAINT "cigarette_orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_category" ADD CONSTRAINT "dish_category_dish_id_dish_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dish"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dish_category" ADD CONSTRAINT "dish_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_table_id_table_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."table"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_lending_user_id_user_id_fk" FOREIGN KEY ("lending_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommended_dishes" ADD CONSTRAINT "recommended_dishes_dish_id_dish_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dish"("id") ON DELETE cascade ON UPDATE no action;