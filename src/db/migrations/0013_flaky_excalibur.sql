CREATE TYPE "public"."status" AS ENUM('pending', 'success', 'rejected', 'failed');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoice" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status" "status" DEFAULT 'pending' NOT NULL;