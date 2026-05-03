CREATE TABLE "addons" (
	"dish_id" integer NOT NULL,
	"add_on_id" integer NOT NULL,
	CONSTRAINT "addons_dish_id_add_on_id_pk" PRIMARY KEY("dish_id","add_on_id")
);
--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "dish_options" jsonb[];--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_dish_id_dish_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."dish"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addons" ADD CONSTRAINT "addons_add_on_id_dish_id_fk" FOREIGN KEY ("add_on_id") REFERENCES "public"."dish"("id") ON DELETE no action ON UPDATE no action;