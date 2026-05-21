ALTER TABLE "credit_topups" RENAME COLUMN "paddle_transaction_id" TO "dodo_payment_id";--> statement-breakpoint
ALTER TABLE "organizations" RENAME COLUMN "paddle_customer_id" TO "dodo_customer_id";--> statement-breakpoint
ALTER TABLE "credit_topups" DROP CONSTRAINT "credit_topups_paddle_transaction_id_unique";--> statement-breakpoint
ALTER TABLE "credit_topups" ADD CONSTRAINT "credit_topups_dodo_payment_id_unique" UNIQUE("dodo_payment_id");