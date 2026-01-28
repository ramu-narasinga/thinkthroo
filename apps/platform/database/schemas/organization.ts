import { pgTable, uuid, text, timestamp, unique, pgPolicy, boolean, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './user';

export const organizations = pgTable('organizations', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  githubOrgId: text('github_org_id').notNull(),
  login: text(),
  avatarUrl: text('avatar_url'),
  description: text(),
  apiUrl: text('api_url'),
  reposUrl: text('repos_url'),
  userId: uuid('user_id')
    .references(() => profiles.userId, { onDelete: 'cascade' }),
  isPersonal: boolean('is_personal').default(true).notNull(),
  creditBalance: numeric('credit_balance', { precision: 10, scale: 2 }).default('10.00').notNull(),
  currentPlanName: text('current_plan_name'),
  lastFetched: timestamp('last_fetched', { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
  unique('organizations_github_org_id_user_id_key').on(table.githubOrgId, table.userId),
  pgPolicy('users can view their own organizations', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can insert their own organizations', {
    as: 'permissive',
    for: 'insert',
    to: ['authenticated'],
    withCheck: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can update their own organizations', {
    as: 'permissive',
    for: 'update',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can delete their own organizations', {
    as: 'permissive',
    for: 'delete',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
]);
