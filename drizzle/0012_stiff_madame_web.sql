CREATE TABLE "cegrates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "cegrate_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_cegrate_id_cegrates_id_fk" FOREIGN KEY ("cegrate_id") REFERENCES "public"."cegrates"("id") ON DELETE set null ON UPDATE no action;