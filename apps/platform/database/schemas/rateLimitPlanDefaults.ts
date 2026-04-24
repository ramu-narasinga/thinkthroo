import { pgTable, text, integer, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Stores the default rate limit values for each plan.
 * This is the single source of truth for plan limits — update a row here
 * to change a plan's limits without a code deploy.
 *
 * Resolution order (first non-null wins):
 *   1. rate_limit_overrides (repo-level)
 *   2. rate_limit_overrides (org-level)
 *   3. rate_limit_plan_defaults (this table)
 */
export const rateLimitPlanDefaults = pgTable('rate_limit_plan_defaults', {
  // plan name matches organizations.current_plan_name values
  planName: text('plan_name').primaryKey().notNull(),
  reviewsPerHour: integer('reviews_per_hour').notNull(),
  filesPerReview: integer('files_per_review').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, () => [
  // Any authenticated user can read plan defaults (needed for client-side display)
  pgPolicy('authenticated users can read rate limit plan defaults', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`true`,
  }),
]);
