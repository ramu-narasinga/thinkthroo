CREATE TABLE "team_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "team_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "repository_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"use_organization_settings" boolean DEFAULT true NOT NULL,
	"enable_reviews" boolean DEFAULT true NOT NULL,
	"enable_pr_summary" boolean DEFAULT true NOT NULL,
	"enable_inline_review_comments" boolean DEFAULT true NOT NULL,
	"enable_architecture_review" boolean DEFAULT true NOT NULL,
	"review_language" text,
	"tone_instructions" text,
	"path_filters" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repository_settings_repository_id_unique" UNIQUE("repository_id")
);
--> statement-breakpoint
ALTER TABLE "repository_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"enable_reviews" boolean DEFAULT true NOT NULL,
	"enable_pr_summary" boolean DEFAULT true NOT NULL,
	"enable_inline_review_comments" boolean DEFAULT true NOT NULL,
	"enable_architecture_review" boolean DEFAULT true NOT NULL,
	"review_language" text,
	"tone_instructions" text,
	"path_filters" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_settings_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
ALTER TABLE "organization_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "repository_settings" ADD CONSTRAINT "repository_settings_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_settings" ADD CONSTRAINT "repository_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_settings" ADD CONSTRAINT "repository_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "service role has full access to team_invitations" ON "team_invitations" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "authenticated users can view team_invitations" ON "team_invitations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "users can view their own repository settings" ON "repository_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can insert their own repository settings" ON "repository_settings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can update their own repository settings" ON "repository_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can delete their own repository settings" ON "repository_settings" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can view their own organization settings" ON "organization_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can insert their own organization settings" ON "organization_settings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can update their own organization settings" ON "organization_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can delete their own organization settings" ON "organization_settings" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));