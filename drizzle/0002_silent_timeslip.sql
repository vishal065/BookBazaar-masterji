CREATE TYPE "public"."order_status" AS ENUM('pending', 'fulfilled', 'cancelled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::text::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."payment_status" USING "status"::text::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
DROP TYPE "public"."status";