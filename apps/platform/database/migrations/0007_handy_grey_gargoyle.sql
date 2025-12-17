ALTER TABLE "repositories" ADD COLUMN "github_repo_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_github_repo_id_unique" UNIQUE("github_repo_id");