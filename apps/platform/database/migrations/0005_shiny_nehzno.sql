ALTER TABLE "async_tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chunks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "document_chunks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "embeddings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "unstructured_chunks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "async_tasks_user_id_idx" ON "async_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "async_tasks_status_idx" ON "async_tasks" USING btree ("status");--> statement-breakpoint
ALTER POLICY "users can select their own installations" ON "installations" RENAME TO "users can view their own installations";--> statement-breakpoint
ALTER POLICY "Enable insert for users based on user_id" ON "repositories" RENAME TO "users can view their own repositories";--> statement-breakpoint
ALTER POLICY "Enable insert for authenticated users only" ON "repositories" RENAME TO "users can insert their own repositories";--> statement-breakpoint
ALTER POLICY "Enable users to view their own data only" ON "repositories" RENAME TO "users can update their own repositories";--> statement-breakpoint
CREATE POLICY "users can view their own async tasks" ON "async_tasks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can insert their own async tasks" ON "async_tasks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can update their own async tasks" ON "async_tasks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own async tasks" ON "async_tasks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can view their own documents" ON "documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can insert their own documents" ON "documents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can update their own documents" ON "documents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can delete their own documents" ON "documents" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can view their own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can update their own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can insert their own profile" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can view their own organizations" ON "organizations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can insert their own organizations" ON "organizations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can update their own organizations" ON "organizations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own organizations" ON "organizations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own installations" ON "installations" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own repositories" ON "repositories" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "users can view their own chunks" ON "chunks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can insert their own chunks" ON "chunks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can update their own chunks" ON "chunks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own chunks" ON "chunks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can view their own document chunks" ON "document_chunks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can insert their own document chunks" ON "document_chunks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own document chunks" ON "document_chunks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can view their own embeddings" ON "embeddings" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can insert their own embeddings" ON "embeddings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can update their own embeddings" ON "embeddings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own embeddings" ON "embeddings" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can view their own unstructured chunks" ON "unstructured_chunks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can insert their own unstructured chunks" ON "unstructured_chunks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can update their own unstructured chunks" ON "unstructured_chunks" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
CREATE POLICY "users can delete their own unstructured chunks" ON "unstructured_chunks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
ALTER POLICY "users can insert their own installations" ON "installations" TO authenticated WITH CHECK ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));--> statement-breakpoint
ALTER POLICY "users can update their own installations" ON "installations" TO authenticated USING ((auth.uid() = (SELECT user_id FROM profiles WHERE id = user_id)));