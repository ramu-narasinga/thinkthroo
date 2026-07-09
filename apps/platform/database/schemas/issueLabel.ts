import { pgTable, uuid, text, timestamp, unique, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repository';

export const issueLabels = pgTable('issue_labels', {
  id:           uuid().defaultRandom().primaryKey().notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  userId:       uuid('user_id').notNull(),
  name:         text('name').notNull(),
  color:        text('color').notNull(), // hex, no '#' prefix — matches GitHub label.color convention
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('issue_labels_repo_name_unique').on(table.repositoryId, table.name),
  pgPolicy('issue_labels_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_labels_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_labels_update', {
    as: 'permissive', for: 'update', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_labels_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
