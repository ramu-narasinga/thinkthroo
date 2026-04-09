CREATE TABLE "pr_architecture_file_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pr_review_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"violation_count" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 100 NOT NULL,
	"violations" text DEFAULT '[]' NOT NULL,
	"doc_references" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pr_architecture_file_results" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pr_reviews" ADD COLUMN "pr_author" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "pr_reviews" ADD COLUMN "slack_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "pr_architecture_file_results" ADD CONSTRAINT "pr_architecture_file_results_pr_review_id_pr_reviews_id_fk" FOREIGN KEY ("pr_review_id") REFERENCES "public"."pr_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Enable read access for users to their architecture file results" ON "pr_architecture_file_results" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
      EXISTS (
        SELECT 1 FROM pr_reviews
        JOIN organizations ON organizations.id = pr_reviews.organization_id
        WHERE pr_reviews.id = "pr_architecture_file_results"."pr_review_id"
        AND organizations.user_id = auth.uid()
      )
    ));