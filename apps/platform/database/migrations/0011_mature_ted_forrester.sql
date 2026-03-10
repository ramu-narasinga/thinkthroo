CREATE TABLE "skill_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_slug" text NOT NULL,
	"weekly_downloads" integer DEFAULT 0 NOT NULL,
	"total_downloads" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "skill_stats_skill_slug_unique" UNIQUE("skill_slug")
);
--> statement-breakpoint
ALTER TABLE "skill_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "Anyone can read skill stats" ON "skill_stats" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Service role can manage skill stats" ON "skill_stats" AS PERMISSIVE FOR ALL TO "service_role" USING (true);