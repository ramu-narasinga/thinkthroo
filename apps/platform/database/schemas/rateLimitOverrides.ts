import { pgTable, uuid, integer, timestamp, foreignKey, uniqueIndex, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organization';
import { repositories } from './repository';
import { profiles } from './user';

/**
 * Stores per-org and per-repo rate limit overrides.
 *
 * Only has rows for orgs/repos that deviate from the plan defaults.
 * NULL on a field means "no override — use the next level's value".
 *
 * Row types:
 *   repository_id IS NULL  → org-level override (applies to all repos in the org)
 *   repository_id NOT NULL → repo-level override (applies to that repo only)
 *
 * Resolution order for each field independently:
 *   1. repo-level row (repository_id = repoId) — if field is non-null
 *   2. org-level row (repository_id IS NULL)   — if field is non-null
 *   3. rate_limit_plan_defaults for the org's plan
 */
export const rateLimitOverrides = pgTable('rate_limit_overrides', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  organizationId: uuid('organization_id').notNull(),
  // NULL = org-level row; set to a repository id for repo-level override
  repositoryId: uuid('repository_id'),
  userId: uuid('user_id'),
  // NULL = no override for this field — fall through to the next level
  reviewsPerHour: integer('reviews_per_hour'),
  filesPerReview: integer('files_per_review'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  // One org-level row per org (repository_id IS NULL)
  uniqueIndex('rate_limit_overrides_org_null_repo_unique')
    .on(table.organizationId)
    .where(sql`${table.repositoryId} IS NULL`),
  // One repo-level row per org+repo pair (repository_id IS NOT NULL)
  uniqueIndex('rate_limit_overrides_org_repo_unique')
    .on(table.organizationId, table.repositoryId)
    .where(sql`${table.repositoryId} IS NOT NULL`),
  foreignKey({
    columns: [table.organizationId],
    foreignColumns: [organizations.id],
    name: 'rate_limit_overrides_organization_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.repositoryId],
    foreignColumns: [repositories.id],
    name: 'rate_limit_overrides_repository_id_fkey',
  }).onDelete('cascade'),
  foreignKey({
    columns: [table.userId],
    foreignColumns: [profiles.userId],
    name: 'rate_limit_overrides_user_id_fkey',
  }).onDelete('set null'),
  pgPolicy('users can view their own rate limit overrides', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can insert their own rate limit overrides', {
    as: 'permissive',
    for: 'insert',
    to: ['authenticated'],
    withCheck: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can update their own rate limit overrides', {
    as: 'permissive',
    for: 'update',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can delete their own rate limit overrides', {
    as: 'permissive',
    for: 'delete',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
]);
