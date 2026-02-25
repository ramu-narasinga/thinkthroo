CREATE TABLE "invited_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_login" text NOT NULL,
	"email" text,
	"note" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "invited_users_github_login_unique" UNIQUE("github_login")
);
--> statement-breakpoint
ALTER TABLE "invited_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "service role has full access to invited_users" ON "invited_users" AS PERMISSIVE FOR ALL TO "service_role" USING (true);--> statement-breakpoint
CREATE POLICY "authenticated users can view invited_users" ON "invited_users" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);