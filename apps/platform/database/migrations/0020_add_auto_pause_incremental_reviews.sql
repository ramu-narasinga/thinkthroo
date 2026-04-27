ALTER TABLE "organization_settings" ADD COLUMN "auto_pause_after_reviewed_commits" integer NOT NULL DEFAULT 5;
--> statement-breakpoint
ALTER TABLE "repository_settings" ADD COLUMN "auto_pause_after_reviewed_commits" integer NOT NULL DEFAULT 5;
