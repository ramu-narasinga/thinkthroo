ALTER TABLE "agent_document_skills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agent_document_skills" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
CREATE POLICY "agent_document_skills_select" ON "agent_document_skills" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "agent_document_skills"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_document_skills_insert" ON "agent_document_skills" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "agent_document_skills"."user_id"));--> statement-breakpoint
CREATE POLICY "agent_document_skills_delete" ON "agent_document_skills" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "agent_document_skills"."user_id"));