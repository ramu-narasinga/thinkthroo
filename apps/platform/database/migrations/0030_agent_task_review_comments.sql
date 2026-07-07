CREATE TABLE "agent_task_review_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"issue_number" integer,
	"filename" text NOT NULL,
	"start_line" integer NOT NULL,
	"end_line" integer,
	"body" text NOT NULL,
	"severity" text DEFAULT 'suggestion' NOT NULL,
	"author_type" text DEFAULT 'agent' NOT NULL,
	"parent_comment_id" uuid,
	"github_comment_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_task_review_comments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "agent_task_review_comments" ADD CONSTRAINT "agent_task_review_comments_task_id_agent_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agent_tasks"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "agent_task_review_comments" ADD CONSTRAINT "agent_task_review_comments_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE POLICY "agent_task_review_comments_select" ON "agent_task_review_comments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "agent_task_review_comments"."user_id"));
--> statement-breakpoint
CREATE POLICY "agent_task_review_comments_insert" ON "agent_task_review_comments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "agent_task_review_comments"."user_id"));
--> statement-breakpoint
CREATE POLICY "agent_task_review_comments_update" ON "agent_task_review_comments" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "agent_task_review_comments"."user_id"));
