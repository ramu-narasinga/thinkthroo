import { pgTable, uuid, text, timestamp, integer, numeric, pgPolicy, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organization';

// Kept for future GitHub Marketplace listing (requires 100 installs before applying)
export const marketplacePurchases = pgTable('marketplace_purchases', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  githubAccountId: text('github_account_id').notNull(),
  githubAccountLogin: text('github_account_login').notNull(),
  githubAccountType: text('github_account_type').notNull(), // 'User' or 'Organization'
  action: text().notNull(), // 'purchased', 'changed', 'cancelled'
  planName: text('plan_name').notNull(),
  planId: text('plan_id').notNull(),
  monthlyPriceInCents: integer('monthly_price_in_cents').notNull(),
  previousPlanName: text('previous_plan_name'),
  previousMonthlyPriceInCents: integer('previous_monthly_price_in_cents'),
  marketplacePurchaseData: text('marketplace_purchase_data'), // JSON stringified payload
  purchasedAt: timestamp('purchased_at', { withTimezone: true, mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
}, (table) => [
  pgPolicy('Enable read access for authenticated users to marketplace purchases', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = ${table.organizationId}
        AND organizations.user_id = auth.uid()
      )
    )`,
  }),
]);

export const creditTransactions = pgTable('credit_transactions', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  // 'subscription_grant' | 'topup_purchase' | 'ai_usage' | 'refund' | 'adjustment'
  transactionType: text('transaction_type').notNull(),
  // positive = credit added, negative = credit deducted
  amount: numeric({ precision: 10, scale: 2 }).notNull(),
  balanceAfter: numeric('balance_after', { precision: 10, scale: 2 }).notNull(),
  // 'paddle_subscription' | 'paddle_topup' | 'pr_review' | 'manual'
  referenceType: text('reference_type'),
  // PR number, Paddle transaction ID, etc.
  referenceId: text('reference_id'),
  // Deduplicates retries for usage deductions.
  idempotencyKey: text('idempotency_key'),
  metadata: text(), // JSON stringified additional data
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('credit_transactions_org_idempotency_key_unique')
    .on(table.organizationId, table.idempotencyKey)
    .where(sql`${table.idempotencyKey} is not null`),
  pgPolicy('Enable read access for users to their credit transactions', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = ${table.organizationId}
        AND organizations.user_id = auth.uid()
      )
    )`,
  }),
]);

export const aiUsageLogs = pgTable('ai_usage_logs', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  repositoryFullName: text('repository_full_name').notNull(),
  prNumber: integer('pr_number').notNull(),
  modelName: text('model_name').notNull(),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  costUsd: numeric('cost_usd', { precision: 10, scale: 4 }).notNull(),
  creditsDeducted: numeric('credits_deducted', { precision: 10, scale: 2 }).notNull(),
  creditTransactionId: uuid('credit_transaction_id').references(() => creditTransactions.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('Enable read access for users to their AI usage logs', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = ${table.organizationId}
        AND organizations.user_id = auth.uid()
      )
    )`,
  }),
]);

// One-time credit bundle purchases via Paddle (separate from subscriptions)
export const creditTopups = pgTable('credit_topups', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  // Paddle transaction ID for the one-time purchase
  paddleTransactionId: text('paddle_transaction_id').notNull().unique(),
  creditsAdded: numeric('credits_added', { precision: 10, scale: 2 }).notNull(),
  amountUsd: numeric('amount_usd', { precision: 10, scale: 2 }).notNull(),
  // 'completed' | 'refunded'
  status: text('status').notNull().default('completed'),
  creditTransactionId: uuid('credit_transaction_id').references(() => creditTransactions.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('Enable read access for users to their credit topups', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(
      EXISTS (
        SELECT 1 FROM organizations
        WHERE organizations.id = ${table.organizationId}
        AND organizations.user_id = auth.uid()
      )
    )`,
  }),
]);
