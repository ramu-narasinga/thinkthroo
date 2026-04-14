import { pgTable, uuid, text, boolean, timestamp, unique, pgPolicy, foreignKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organization';
import { profiles } from './user';

export const organizationSettings = pgTable('organization_settings', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  organizationId: uuid('organization_id').notNull(),
  userId: uuid('user_id'),

  // Master on/off — when false the GitHub App skips all repos in this org
  enableReviews: boolean('enable_reviews').default(true).notNull(),

  // Generates the PR summary comment
  enablePrSummary: boolean('enable_pr_summary').default(true).notNull(),

  // Inline per-line review comments (Pro plan only — enforced in app layer)
  enableInlineReviewComments: boolean('enable_inline_review_comments').default(true).notNull(),

  // Architecture rule checking (Pro plan only — enforced in app layer)
  enableArchitectureReview: boolean('enable_architecture_review').default(true).notNull(),

  // Natural language for review output, e.g. 'English'
  reviewLanguage: text('review_language'),

  // Free-form tone prompt, e.g. 'Friendly, concise, professional'
  toneInstructions: text('tone_instructions'),

  // Glob patterns to exclude from review, e.g. 'dist/**', '*.lock'
  pathFilters: text('path_filters').array().default(sql`ARRAY[]::text[]`).notNull(),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  unique('organization_settings_organization_id_unique').on(table.organizationId),
  foreignKey({
    columns: [table.organizationId],
    foreignColumns: [organizations.id],
    name: 'organization_settings_organization_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [profiles.userId],
    name: 'organization_settings_user_id_fkey',
  }).onDelete('cascade'),
  pgPolicy('users can view their own organization settings', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can insert their own organization settings', {
    as: 'permissive',
    for: 'insert',
    to: ['authenticated'],
    withCheck: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can update their own organization settings', {
    as: 'permissive',
    for: 'update',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can delete their own organization settings', {
    as: 'permissive',
    for: 'delete',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
]);
