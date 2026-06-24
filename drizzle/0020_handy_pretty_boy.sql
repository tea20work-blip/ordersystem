CREATE TABLE "daily_sales_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"total_orders" integer DEFAULT 0,
	"completed_orders" integer DEFAULT 0,
	"cancelled_orders" integer DEFAULT 0,
	"gross_revenue" integer DEFAULT 0,
	"cash_revenue" integer DEFAULT 0,
	"online_revenue" integer DEFAULT 0,
	"lending_total" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_sales_summary_date_unique" UNIQUE("date")
);
