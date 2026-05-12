ALTER TABLE "organization_settings" ADD COLUMN "member_default_role" text DEFAULT 'Member' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "allow_member_invites" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD COLUMN "require_member_approval" boolean DEFAULT true NOT NULL;
