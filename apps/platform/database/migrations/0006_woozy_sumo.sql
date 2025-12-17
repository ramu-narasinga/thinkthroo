ALTER TABLE "async_tasks" DROP CONSTRAINT "async_tasks_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "installations" DROP CONSTRAINT "installations_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "repositories" DROP CONSTRAINT "repositories_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "chunks" DROP CONSTRAINT "chunks_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "embeddings" DROP CONSTRAINT "embeddings_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "unstructured_chunks" DROP CONSTRAINT "unstructured_chunks_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "repositories" ALTER COLUMN "user_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "async_tasks" ADD CONSTRAINT "async_tasks_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installations" ADD CONSTRAINT "installations_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unstructured_chunks" ADD CONSTRAINT "unstructured_chunks_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER POLICY "users can view their own async tasks" ON "async_tasks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can insert their own async tasks" ON "async_tasks" TO authenticated WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can update their own async tasks" ON "async_tasks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can delete their own async tasks" ON "async_tasks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can view their own organizations" ON "organizations" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can insert their own organizations" ON "organizations" TO authenticated WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can update their own organizations" ON "organizations" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can delete their own organizations" ON "organizations" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can view their own installations" ON "installations" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can insert their own installations" ON "installations" TO authenticated WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can update their own installations" ON "installations" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can delete their own installations" ON "installations" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can view their own chunks" ON "chunks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can insert their own chunks" ON "chunks" TO authenticated WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can update their own chunks" ON "chunks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can delete their own chunks" ON "chunks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can view their own document chunks" ON "document_chunks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can insert their own document chunks" ON "document_chunks" TO authenticated WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can delete their own document chunks" ON "document_chunks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can view their own embeddings" ON "embeddings" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can insert their own embeddings" ON "embeddings" TO authenticated WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can update their own embeddings" ON "embeddings" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can delete their own embeddings" ON "embeddings" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can view their own unstructured chunks" ON "unstructured_chunks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can insert their own unstructured chunks" ON "unstructured_chunks" TO authenticated WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can update their own unstructured chunks" ON "unstructured_chunks" TO authenticated USING ((auth.uid() = user_id));--> statement-breakpoint
ALTER POLICY "users can delete their own unstructured chunks" ON "unstructured_chunks" TO authenticated USING ((auth.uid() = user_id));