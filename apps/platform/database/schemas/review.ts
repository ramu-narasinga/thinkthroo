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
  prAuthor: text('pr_author').notNull().default(''),
  summaryPoints: text('summary_points').notNull(), // JSON stringified string[]
  creditsDeducted: numeric('credits_deducted', { precision: 10, scale: 2 }).notNull().default('0'),
  slackStatus: text('slack_status').notNull().default('pending'),
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

export const prArchitectureFileResults = pgTable('pr_architecture_file_results', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  prReviewId: uuid('pr_review_id')
    .references(() => prReviews.id, { onDelete: 'cascade' })
    .notNull(),
  filename: text('filename').notNull(),
  violationCount: integer('violation_count').notNull().default(0),
  score: integer('score').notNull().default(100),
  violations: text('violations').notNull().default('[]'), // JSON: {startLine,endLine,comment}[]
  docReferences: text('doc_references').notNull().default('[]'), // JSON: {name,excerpt,documentId}[]
  creditsDeducted: numeric('credits_deducted', { precision: 10, scale: 4 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('Enable read access for users to their architecture file results', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(
      EXISTS (
        SELECT 1 FROM pr_reviews
        JOIN organizations ON organizations.id = pr_reviews.organization_id
        WHERE pr_reviews.id = ${table.prReviewId}
        AND organizations.user_id = auth.uid()
      )
    )`,
  }),
]);
