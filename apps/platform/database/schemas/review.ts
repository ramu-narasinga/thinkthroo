import { pgTable, uuid, text, timestamp, integer, numeric, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organization';

export const prReviews = pgTable('pr_reviews', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  repositoryFullName: text('repository_full_name').notNull(),
  prNumber: integer('pr_number').notNull(),
  prTitle: text('pr_title').notNull(),
  summaryPoints: text('summary_points').notNull(), // JSON stringified string[]
  creditsDeducted: numeric('credits_deducted', { precision: 10, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('Enable read access for users to their pr reviews', {
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
