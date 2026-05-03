CREATE TABLE "cigarette" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cigarette_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"cigarette_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" integer NOT NULL,
	"table_id" integer,
	"status" "order_status" DEFAULT 'pending',
	"user_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "max_select_options" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "min_select_options" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_number_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "cigarette_orders" ADD CONSTRAINT "cigarette_orders_cigarette_id_cigarette_id_fk" FOREIGN KEY ("cigarette_id") REFERENCES "public"."cigarette"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cigarette_orders" ADD CONSTRAINT "cigarette_orders_table_id_table_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."table"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cigarette_orders" ADD CONSTRAINT "cigarette_orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;