ALTER TABLE "organizations" ADD COLUMN "doc_storage_used_mb" numeric(10, 4) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "repository_settings" ADD COLUMN "auto_pause_after_reviewed_commits" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "auto_pause_after_reviewed_commits" integer DEFAULT 5 NOT NULL;