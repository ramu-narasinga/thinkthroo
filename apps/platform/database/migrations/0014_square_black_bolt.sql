CREATE TABLE "pr_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"repository_full_name" text NOT NULL,
	"pr_number" integer NOT NULL,
	"pr_title" text NOT NULL,
	"summary_points" text NOT NULL,
	"credits_deducted" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pr_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pr_reviews" ADD CONSTRAINT "pr_reviews_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Enable read access for users to their pr reviews" ON "pr_reviews" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = "pr_reviews"."organization_id"
        AND organizations.user_id = auth.uid()
      )
    ));