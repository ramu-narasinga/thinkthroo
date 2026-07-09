CREATE TABLE "agent_task_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"tool_name" text,
	"tool_use_id" text,
	"tool_input" text,
	"preview" text,
	"raw" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_task_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agent_task_events" ADD CONSTRAINT "agent_task_events_task_id_agent_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agent_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "agent_task_events_select" ON "agent_task_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "agent_task_events"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_task_events_insert" ON "agent_task_events" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "agent_task_events"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_task_events_update" ON "agent_task_events" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = "agent_task_events"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_task_events_delete" ON "agent_task_events" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "agent_task_events"."user_id"));
