ALTER TABLE "dish" ADD COLUMN "dish_varients" jsonb[];--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "max_select_varient" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "dish" ADD COLUMN "min_select_varient" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "dish" DROP COLUMN "min_select_options";