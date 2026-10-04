CREATE TABLE "admin_notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"dismissed_at" timestamp,
	CONSTRAINT "admin_notification_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "admin_push_token" (
	"token" text PRIMARY KEY NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
