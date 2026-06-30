CREATE TABLE "issue_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"issue_number" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"author_type" text NOT NULL,
	"agent_task_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD COLUMN "user_message" text;--> statement-breakpoint
ALTER TABLE "issue_comments" ADD CONSTRAINT "issue_comments_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_comments" ADD CONSTRAINT "issue_comments_agent_task_id_agent_tasks_id_fk" FOREIGN KEY ("agent_task_id") REFERENCES "public"."agent_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "issue_comments_select" ON "issue_comments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "issue_comments"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_comments_insert" ON "issue_comments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "issue_comments"."user_id"));
