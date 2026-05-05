CREATE TYPE "knowledge"."platforms" AS ENUM('x', 'facebook', 'instagram', 'google');--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ADD COLUMN "source_campaign_id" uuid;--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ADD COLUMN "platform" "knowledge"."platforms" NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ADD COLUMN "audience_region" varchar(10);--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ADD COLUMN "audience_age_min" numeric;--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ADD COLUMN "audience_age_max" numeric;--> statement-breakpoint
ALTER TABLE "knowledge"."ads" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledge"."ads" DROP COLUMN "original";