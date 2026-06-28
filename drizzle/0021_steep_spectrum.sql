CREATE TABLE "poster" (
	"id" serial PRIMARY KEY NOT NULL,
	"poster_name" varchar(255) NOT NULL,
	"poster_image" varchar(255) NOT NULL,
	"poster_url" varchar(255) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
