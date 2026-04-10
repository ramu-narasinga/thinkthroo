import { pgTable, uuid, text, timestamp, boolean, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organization';

export const slackIntegrations = pgTable('slack_integrations', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  teamId: text('team_id').notNull(),
  teamName: text('team_name').notNull().default(''),
  accessToken: text('access_token').notNull(),
  channelId: text('channel_id').notNull(),
  channelName: text('channel_name').notNull().default(''),
  webhookUrl: text('webhook_url').notNull().default(''),
  botUserId: text('bot_user_id').notNull().default(''),
  notifyPrReviews: boolean('notify_pr_reviews').notNull().default(true),
  notifyArchitectureViolations: boolean('notify_architecture_violations').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('Enable read access for users to their slack integrations', {
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
