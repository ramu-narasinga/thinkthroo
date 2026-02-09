import { pgTable, uuid, text, timestamp, integer, numeric, pgPolicy, foreignKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organization';

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
        WHERE organizations.id = marketplace_purchases.organization_id 
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
  transactionType: text('transaction_type').notNull(), // 'initial_bonus', 'purchase', 'ai_usage', 'refund', 'adjustment'
  amount: numeric({ precision: 10, scale: 2 }).notNull(), // positive = credit, negative = debit
  balanceAfter: numeric('balance_after', { precision: 10, scale: 2 }).notNull(),
  referenceType: text('reference_type'), // 'marketplace_purchase', 'pr_review', 'manual'
  referenceId: text('reference_id'), // PR number, purchase ID, etc.
  metadata: text(), // JSON stringified additional data
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('Enable read access for users to their credit transactions', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(
      EXISTS (
        SELECT 1 FROM organizations 
        WHERE organizations.id = credit_transactions.organization_id 
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
  modelName: text('model_name').notNull(), // 'claude-sonnet-3.5', 'gpt-4', etc.
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
        WHERE organizations.id = ai_usage_logs.organization_id 
        AND organizations.user_id = auth.uid()
      )
    )`,
  }),
]);
