CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"runtime_id" uuid,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"model" text DEFAULT 'claude-sonnet-4-6' NOT NULL,
	"visibility" text DEFAULT 'personal' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "daemon_runtimes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"api_key" text NOT NULL,
	"status" text DEFAULT 'offline' NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daemon_runtimes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_runtime_id_daemon_runtimes_id_fk" FOREIGN KEY ("runtime_id") REFERENCES "public"."daemon_runtimes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "agents_select" ON "agents" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "agents"."user_id"));--> statement-breakpoint
CREATE POLICY "agents_insert" ON "agents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "agents"."user_id"));--> statement-breakpoint
CREATE POLICY "agents_update" ON "agents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "agents"."user_id"));--> statement-breakpoint
CREATE POLICY "agents_delete" ON "agents" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "agents"."user_id"));--> statement-breakpoint
CREATE POLICY "daemon_runtimes_select" ON "daemon_runtimes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "daemon_runtimes"."user_id"));--> statement-breakpoint
CREATE POLICY "daemon_runtimes_insert" ON "daemon_runtimes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "daemon_runtimes"."user_id"));--> statement-breakpoint
CREATE POLICY "daemon_runtimes_update" ON "daemon_runtimes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "daemon_runtimes"."user_id"));--> statement-breakpoint
CREATE POLICY "daemon_runtimes_delete" ON "daemon_runtimes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "daemon_runtimes"."user_id"));