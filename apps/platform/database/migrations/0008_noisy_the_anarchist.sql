CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"repository_full_name" text NOT NULL,
	"pr_number" integer NOT NULL,
	"model_name" text NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"total_tokens" integer NOT NULL,
	"cost_usd" numeric(10, 4) NOT NULL,
	"credits_deducted" numeric(10, 2) NOT NULL,
	"credit_transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"transaction_type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"balance_after" numeric(10, 2) NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "marketplace_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_account_id" text NOT NULL,
	"github_account_login" text NOT NULL,
	"github_account_type" text NOT NULL,
	"action" text NOT NULL,
	"plan_name" text NOT NULL,
	"plan_id" text NOT NULL,
	"monthly_price_in_cents" integer NOT NULL,
	"previous_plan_name" text,
	"previous_monthly_price_in_cents" integer,
	"marketplace_purchase_data" text,
	"purchased_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_personal" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "credit_balance" numeric(10, 2) DEFAULT '10.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "current_plan_name" text;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "has_access" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "last_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "removed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_credit_transaction_id_credit_transactions_id_fk" FOREIGN KEY ("credit_transaction_id") REFERENCES "public"."credit_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_purchases" ADD CONSTRAINT "marketplace_purchases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Enable read access for users to their AI usage logs" ON "ai_usage_logs" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
      EXISTS (
        SELECT 1 FROM organizations 
        WHERE organizations.id = ai_usage_logs.organization_id 
        AND organizations.user_id = auth.uid()
      )
    ));--> statement-breakpoint
CREATE POLICY "Enable read access for users to their credit transactions" ON "credit_transactions" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
      EXISTS (
        SELECT 1 FROM organizations 
        WHERE organizations.id = credit_transactions.organization_id 
        AND organizations.user_id = auth.uid()
      )
    ));--> statement-breakpoint
CREATE POLICY "Enable read access for authenticated users to marketplace purchases" ON "marketplace_purchases" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((
      EXISTS (
        SELECT 1 FROM organizations 
        WHERE organizations.id = marketplace_purchases.organization_id 
        AND organizations.user_id = auth.uid()
      )
    ));