CREATE TABLE "squads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"leader_agent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "squad_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"squad_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"member_type" text NOT NULL,
	"agent_id" uuid,
	"member_id" uuid,
	"role" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "squad_members_squad_agent_unique" UNIQUE("squad_id","member_type","agent_id")
);
--> statement-breakpoint
ALTER TABLE "issue_board_states" ADD COLUMN "assignee_squad_id" uuid;
--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "squads" ADD CONSTRAINT "squads_leader_agent_id_agents_id_fk" FOREIGN KEY ("leader_agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_squad_id_squads_id_fk" FOREIGN KEY ("squad_id") REFERENCES "public"."squads"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "issue_board_states" ADD CONSTRAINT "issue_board_states_assignee_squad_id_squads_id_fk" FOREIGN KEY ("assignee_squad_id") REFERENCES "public"."squads"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "squads" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "squad_members" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "squads_select" ON "squads" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "user_id"));
--> statement-breakpoint
CREATE POLICY "squads_insert" ON "squads" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "user_id"));
--> statement-breakpoint
CREATE POLICY "squads_update" ON "squads" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "user_id"));
--> statement-breakpoint
CREATE POLICY "squads_delete" ON "squads" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "user_id"));
--> statement-breakpoint
CREATE POLICY "squad_members_select" ON "squad_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "user_id"));
--> statement-breakpoint
CREATE POLICY "squad_members_insert" ON "squad_members" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "user_id"));
--> statement-breakpoint
CREATE POLICY "squad_members_update" ON "squad_members" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "user_id"));
--> statement-breakpoint
CREATE POLICY "squad_members_delete" ON "squad_members" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "user_id"));
