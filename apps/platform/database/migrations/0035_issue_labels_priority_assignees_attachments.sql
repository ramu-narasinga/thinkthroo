CREATE TABLE "issue_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_labels_repo_name_unique" UNIQUE("repository_id","name")
);
--> statement-breakpoint
ALTER TABLE "issue_labels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "issue_board_state_labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_board_state_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_board_state_labels_pair_unique" UNIQUE("issue_board_state_id","label_id")
);
--> statement-breakpoint
ALTER TABLE "issue_board_state_labels" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "issue_assignees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_board_state_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"assignee_type" text NOT NULL,
	"assignee_agent_id" uuid,
	"assignee_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_assignees_board_agent_unique" UNIQUE("issue_board_state_id","assignee_type","assignee_agent_id"),
	CONSTRAINT "issue_assignees_board_member_unique" UNIQUE("issue_board_state_id","assignee_type","assignee_member_id")
);
--> statement-breakpoint
ALTER TABLE "issue_assignees" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "issue_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_board_state_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_attachments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "issue_board_states" DROP CONSTRAINT "issue_board_states_assignee_agent_id_agents_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD COLUMN "context" text;--> statement-breakpoint
ALTER TABLE "issue_board_states" ADD COLUMN "priority" text DEFAULT 'no_priority' NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_labels" ADD CONSTRAINT "issue_labels_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_board_state_labels" ADD CONSTRAINT "issue_board_state_labels_issue_board_state_id_issue_board_states_id_fk" FOREIGN KEY ("issue_board_state_id") REFERENCES "public"."issue_board_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_board_state_labels" ADD CONSTRAINT "issue_board_state_labels_label_id_issue_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."issue_labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_issue_board_state_id_issue_board_states_id_fk" FOREIGN KEY ("issue_board_state_id") REFERENCES "public"."issue_board_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_assignee_agent_id_agents_id_fk" FOREIGN KEY ("assignee_agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_assignee_member_id_team_invitations_id_fk" FOREIGN KEY ("assignee_member_id") REFERENCES "public"."team_invitations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_attachments" ADD CONSTRAINT "issue_attachments_issue_board_state_id_issue_board_states_id_fk" FOREIGN KEY ("issue_board_state_id") REFERENCES "public"."issue_board_states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Data migration: backfill issue_assignees from the single-assignee columns being dropped below.
-- Squad-type rows are NOT migrated here — assignee_squad_id stays on issue_board_states untouched.
INSERT INTO "issue_assignees" ("issue_board_state_id", "user_id", "assignee_type", "assignee_agent_id", "assignee_member_id")
SELECT "id", "user_id", 'agent', "assignee_agent_id", NULL FROM "issue_board_states"
WHERE "assignee_type" = 'agent' AND "assignee_agent_id" IS NOT NULL;--> statement-breakpoint
INSERT INTO "issue_assignees" ("issue_board_state_id", "user_id", "assignee_type", "assignee_agent_id", "assignee_member_id")
SELECT "id", "user_id", 'member', NULL, "assignee_member_id" FROM "issue_board_states"
WHERE "assignee_type" = 'member' AND "assignee_member_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_board_states" DROP COLUMN "assignee_type";--> statement-breakpoint
ALTER TABLE "issue_board_states" DROP COLUMN "assignee_agent_id";--> statement-breakpoint
ALTER TABLE "issue_board_states" DROP COLUMN "assignee_member_id";--> statement-breakpoint
CREATE POLICY "issue_labels_select" ON "issue_labels" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "issue_labels"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_labels_insert" ON "issue_labels" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "issue_labels"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_labels_update" ON "issue_labels" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "issue_labels"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_labels_delete" ON "issue_labels" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "issue_labels"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_board_state_labels_select" ON "issue_board_state_labels" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "issue_board_state_labels"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_board_state_labels_insert" ON "issue_board_state_labels" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "issue_board_state_labels"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_board_state_labels_delete" ON "issue_board_state_labels" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "issue_board_state_labels"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_assignees_select" ON "issue_assignees" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "issue_assignees"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_assignees_insert" ON "issue_assignees" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "issue_assignees"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_assignees_delete" ON "issue_assignees" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "issue_assignees"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_attachments_select" ON "issue_attachments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "issue_attachments"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_attachments_insert" ON "issue_attachments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "issue_attachments"."user_id"));--> statement-breakpoint
CREATE POLICY "issue_attachments_delete" ON "issue_attachments" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "issue_attachments"."user_id"));
