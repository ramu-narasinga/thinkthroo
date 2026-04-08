CREATE TABLE "credit_topups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"paddle_transaction_id" text NOT NULL,
	"credits_added" numeric(10, 2) NOT NULL,
	"amount_usd" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"credit_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_topups_paddle_transaction_id_unique" UNIQUE("paddle_transaction_id")
);
--> statement-breakpoint
ALTER TABLE "credit_topups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "current_plan_name" SET DEFAULT 'free';--> statement-breakpoint
UPDATE "organizations" SET "current_plan_name" = 'free' WHERE "current_plan_name" IS NULL;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "current_plan_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "paddle_customer_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "plan_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billing_interval" text;--> statement-breakpoint
ALTER TABLE "credit_topups" ADD CONSTRAINT "credit_topups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_topups" ADD CONSTRAINT "credit_topups_credit_transaction_id_credit_transactions_id_fk" FOREIGN KEY ("credit_transaction_id") REFERENCES "public"."credit_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Enable read access for users to their credit topups" ON "credit_topups" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = "credit_topups"."organization_id"
        AND organizations.user_id = auth.uid()
      )
    ));--> statement-breakpoint
ALTER POLICY "Enable read access for users to their AI usage logs" ON "ai_usage_logs" TO authenticated USING ((
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = "ai_usage_logs"."organization_id"
        AND organizations.user_id = auth.uid()
      )
    ));--> statement-breakpoint
ALTER POLICY "Enable read access for users to their credit transactions" ON "credit_transactions" TO authenticated USING ((
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = "credit_transactions"."organization_id"
        AND organizations.user_id = auth.uid()
      )
    ));--> statement-breakpoint
ALTER POLICY "Enable read access for authenticated users to marketplace purchases" ON "marketplace_purchases" TO authenticated USING ((
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = "marketplace_purchases"."organization_id"
        AND organizations.user_id = auth.uid()
      )
    ));--> statement-breakpoint
ALTER POLICY "Enable read access for authenticated users to customers" ON "customers" TO authenticated USING ((auth.uid() = "customers"."user_id"));--> statement-breakpoint
ALTER POLICY "Enable read access for authenticated users to subscriptions" ON "subscriptions" TO authenticated USING ((
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = "subscriptions"."organization_id"
        AND organizations.user_id = auth.uid()
      )
    ));