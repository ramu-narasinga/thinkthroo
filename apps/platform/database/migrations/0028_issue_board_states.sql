CREATE TABLE "issue_board_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"issue_number" integer NOT NULL,
	"issue_title" text NOT NULL,
	"issue_html_url" text,
	"kanban_status" text DEFAULT 'backlog' NOT NULL,
	"assignee_type" text,
	"assignee_agent_id" uuid,
	"assignee_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_board_states_repo_issue_unique" UNIQUE("repository_id","issue_number")
);
--> statement-breakpoint
ALTER TABLE "issue_board_states" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "issue_board_states" ADD CONSTRAINT "issue_board_states_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_board_states" ADD CONSTRAINT "issue_board_states_assignee_agent_id_agents_id_fk" FOREIGN KEY ("assignee_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "issue_board_states_select" ON "issue_board_states" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "issue_board_states"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_board_states_insert" ON "issue_board_states" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "issue_board_states"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_board_states_update" ON "issue_board_states" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "issue_board_states"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_board_states_delete" ON "issue_board_states" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "issue_board_states"."user_id"));
