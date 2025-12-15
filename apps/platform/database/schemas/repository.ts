import { pgTable, uuid, text, boolean, foreignKey, pgPolicy, bigint, unique, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { installations } from './installation';
import { organizations } from './organization';
import { profiles } from './user';

export const repositories = pgTable('repositories', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  githubRepoId: bigint('github_repo_id', { mode: 'number' }).notNull(), // GitHub's repo ID (unique constraint defined below)
  name: text().notNull(),
  fullName: text('full_name').notNull(),
  private: boolean().default(false).notNull(),
  htmlUrl: text('html_url').notNull(),
  defaultBranch: text('default_branch'),
  installationId: text('installation_id').notNull(),
  organizationId: uuid('organization_id').notNull(),
  userId: uuid('user_id'),
  hasAccess: boolean('has_access').default(true).notNull(), // Tracks current GitHub access status
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }), // Last GitHub sync timestamp
  removedAt: timestamp('removed_at', { withTimezone: true }), // When access was revoked
}, (table) => [
  foreignKey({
    columns: [table.installationId],
    foreignColumns: [installations.installationId],
    name: 'repositories_installation_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.organizationId],
    foreignColumns: [organizations.id],
    name: 'repositories_organization_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [profiles.userId],
    name: 'repositories_user_id_fkey',
  }).onDelete('cascade'),
  unique('repositories_github_repo_id_unique').on(table.githubRepoId),
  pgPolicy('users can view their own repositories', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can insert their own repositories', {
    as: 'permissive',
    for: 'insert',
    to: ['authenticated'],
    withCheck: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can update their own repositories', {
    as: 'permissive',
    for: 'update',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can delete their own repositories', {
    as: 'permissive',
    for: 'delete',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
]);
