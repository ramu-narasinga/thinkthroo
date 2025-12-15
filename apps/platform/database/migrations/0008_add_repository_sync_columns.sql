-- Add columns to track repository access status and sync timestamps
ALTER TABLE "repositories" ADD COLUMN "has_access" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "removed_at" timestamp with time zone;
