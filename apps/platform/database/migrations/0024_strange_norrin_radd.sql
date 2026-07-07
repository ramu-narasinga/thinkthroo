CREATE TABLE "agent_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"runtime_id" uuid,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"issue_number" integer,
	"issue_title" text,
	"issue_body" text,
	"issue_html_url" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"failure_reason" text,
	"result" text,
	"wait_reason" text,
	"session_id" text,
	"work_dir" text,
	"dispatched_at" timestamp with time zone,
	"priority" integer DEFAULT 0 NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"force_fresh_session" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "agent_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_runtime_id_daemon_runtimes_id_fk" FOREIGN KEY ("runtime_id") REFERENCES "public"."daemon_runtimes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "agent_tasks_select" ON "agent_tasks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "agent_tasks"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_tasks_insert" ON "agent_tasks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "agent_tasks"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_tasks_update" ON "agent_tasks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "agent_tasks"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_tasks_delete" ON "agent_tasks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "agent_tasks"."user_id"));