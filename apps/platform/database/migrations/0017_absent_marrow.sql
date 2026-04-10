CREATE TABLE "slack_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"team_id" text NOT NULL,
	"team_name" text DEFAULT '' NOT NULL,
	"access_token" text NOT NULL,
	"channel_id" text NOT NULL,
	"channel_name" text DEFAULT '' NOT NULL,
	"webhook_url" text DEFAULT '' NOT NULL,
	"bot_user_id" text DEFAULT '' NOT NULL,
	"notify_pr_reviews" boolean DEFAULT true NOT NULL,
	"notify_architecture_violations" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slack_integrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "slack_integrations" ADD CONSTRAINT "slack_integrations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Enable read access for users to their slack integrations" ON "slack_integrations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = "slack_integrations"."organization_id"
        AND organizations.user_id = auth.uid()
      )
    ));