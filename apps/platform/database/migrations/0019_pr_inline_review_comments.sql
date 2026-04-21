CREATE TABLE "pr_inline_review_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pr_review_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"start_line" integer NOT NULL,
	"end_line" integer NOT NULL,
	"comment" text NOT NULL,
	"credits_deducted" numeric(10, 4) NOT NULL DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pr_inline_review_comments" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "pr_inline_review_comments" ADD CONSTRAINT "pr_inline_review_comments_pr_review_id_fkey" FOREIGN KEY ("pr_review_id") REFERENCES "public"."pr_reviews"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE POLICY "Enable read access for users to their inline review comments" ON "pr_inline_review_comments" AS PERMISSIVE FOR SELECT TO "authenticated" USING (
  EXISTS (
    SELECT 1 FROM pr_reviews
    JOIN organizations ON organizations.id = pr_reviews.organization_id
    WHERE pr_reviews.id = pr_review_id
    AND organizations.user_id = auth.uid()
  )
);
