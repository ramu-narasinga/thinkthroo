import { pgTable, uuid, text, unique, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { profiles } from './user';

export const installations = pgTable('installations', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  installationId: text('installation_id').notNull(),
  githubOrgId: text('github_org_id').notNull(),
  userId: uuid('user_id')
    .references(() => profiles.userId, { onDelete: 'cascade' })
    .notNull(),
}, (table) => [
  unique('installations_installation_id_key').on(table.installationId),
  unique('installations_github_org_id_user_id_key').on(table.githubOrgId, table.userId),
  pgPolicy('users can view their own installations', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can insert their own installations', {
    as: 'permissive',
    for: 'insert',
    to: ['authenticated'],
    withCheck: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can update their own installations', {
    as: 'permissive',
    for: 'update',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can delete their own installations', {
    as: 'permissive',
    for: 'delete',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
]);
