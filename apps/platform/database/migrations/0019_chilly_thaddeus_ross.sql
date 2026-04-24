CREATE TABLE "rate_limit_plan_defaults" (
	"plan_name" text PRIMARY KEY NOT NULL,
	"reviews_per_hour" integer NOT NULL,
	"files_per_review" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rate_limit_plan_defaults" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "rate_limit_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"repository_id" uuid,
	"user_id" uuid,
	"reviews_per_hour" integer,
	"files_per_review" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rate_limit_overrides" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rate_limit_overrides" ADD CONSTRAINT "rate_limit_overrides_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limit_overrides" ADD CONSTRAINT "rate_limit_overrides_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limit_overrides" ADD CONSTRAINT "rate_limit_overrides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_overrides_org_null_repo_unique" ON "rate_limit_overrides" USING btree ("organization_id") WHERE "rate_limit_overrides"."repository_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "rate_limit_overrides_org_repo_unique" ON "rate_limit_overrides" USING btree ("organization_id","repository_id") WHERE "rate_limit_overrides"."repository_id" IS NOT NULL;--> statement-breakpoint
CREATE POLICY "authenticated users can read rate limit plan defaults" ON "rate_limit_plan_defaults" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "users can view their own rate limit overrides" ON "rate_limit_overrides" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can insert their own rate limit overrides" ON "rate_limit_overrides" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can update their own rate limit overrides" ON "rate_limit_overrides" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can delete their own rate limit overrides" ON "rate_limit_overrides" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));