CREATE TABLE "agent_document_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_document_skills" ADD CONSTRAINT "agent_document_skills_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_document_skills" ADD CONSTRAINT "agent_document_skills_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_document_skills_unique" ON "agent_document_skills" USING btree ("agent_id","document_id");--> statement-breakpoint
ALTER TABLE "agent_document_skills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "agent_document_skills_select" ON "agent_document_skills" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = "user_id"));--> statement-breakpoint
CREATE POLICY "agent_document_skills_insert" ON "agent_document_skills" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = "user_id"));--> statement-breakpoint
CREATE POLICY "agent_document_skills_delete" ON "agent_document_skills" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = "user_id"));
