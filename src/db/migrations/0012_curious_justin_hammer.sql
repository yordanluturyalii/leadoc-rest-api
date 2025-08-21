CREATE TYPE "public"."package_name" AS ENUM('MINI', 'MEDIUM', 'MEGA');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_name" "package_name" NOT NULL,
	"date" date DEFAULT now(),
	"amount" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
