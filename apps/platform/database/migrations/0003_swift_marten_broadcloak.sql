CREATE TABLE "async_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" jsonb,
	"result" jsonb,
	"user_id" uuid NOT NULL,
	"duration" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "codebase_arch" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "codebase_arch" CASCADE;--> statement-breakpoint
DROP TABLE "User" CASCADE;--> statement-breakpoint
ALTER TABLE "challenge_submissions" DROP CONSTRAINT "fk_user_id";
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_parent_id_fkey";
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_repository_id_fkey";
--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "repository_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ALTER COLUMN "index" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chunks" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document_chunks" ALTER COLUMN "document_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "chunk_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "model" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "unstructured_chunks" ALTER COLUMN "text" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "unstructured_chunks" ALTER COLUMN "index" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "unstructured_chunks" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "unstructured_chunks" ALTER COLUMN "document_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "unstructured_chunks" ALTER COLUMN "document_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "editor_data" jsonb;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "total_char_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "total_line_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "client_id" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "slug" varchar(255);--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "chunk_task_id" uuid;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "embedding_task_id" uuid;--> statement-breakpoint
ALTER TABLE "async_tasks" ADD CONSTRAINT "async_tasks_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_submissions" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_id_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_chunk_task_id_async_tasks_id_fk" FOREIGN KEY ("chunk_task_id") REFERENCES "public"."async_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_embedding_task_id_async_tasks_id_fk" FOREIGN KEY ("embedding_task_id") REFERENCES "public"."async_tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "documents_repository_id_idx" ON "documents" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "documents_user_id_idx" ON "documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "documents_parent_id_idx" ON "documents" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "documents_type_idx" ON "documents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "documents_chunk_task_id_idx" ON "documents" USING btree ("chunk_task_id");--> statement-breakpoint
CREATE INDEX "documents_embedding_task_id_idx" ON "documents" USING btree ("embedding_task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_client_id_user_id_unique" ON "documents" USING btree ("client_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_slug_repository_id_unique" ON "documents" USING btree ("slug","repository_id") WHERE "documents"."slug" is not null;--> statement-breakpoint
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_chunks_chunk_id_idx" ON "document_chunks" USING btree ("chunk_id");--> statement-breakpoint
CREATE INDEX "embeddings_user_id_idx" ON "embeddings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "unstructured_chunks_document_id_idx" ON "unstructured_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "unstructured_chunks_user_id_idx" ON "unstructured_chunks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "unstructured_chunks_composite_id_idx" ON "unstructured_chunks" USING btree ("composite_id");