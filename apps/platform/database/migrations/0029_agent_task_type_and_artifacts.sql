ALTER TABLE "agent_tasks" ADD COLUMN "task_type" text DEFAULT 'implementation' NOT NULL;--> statement-breakpoint
CREATE TABLE "agent_task_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"captured_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_task_artifacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agent_task_artifacts" ADD CONSTRAINT "agent_task_artifacts_task_id_agent_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agent_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "agent_task_artifacts_select" ON "agent_task_artifacts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "agent_task_artifacts"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_task_artifacts_insert" ON "agent_task_artifacts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "agent_task_artifacts"."user_id"));
