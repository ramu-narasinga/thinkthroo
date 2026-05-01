ALTER TABLE "credit_transactions" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX "credit_transactions_org_idempotency_key_unique"
  ON "credit_transactions" ("organization_id", "idempotency_key")
  WHERE "idempotency_key" IS NOT NULL;