import { pgTable, uuid, text, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { issueBoardStates } from './issueBoardState';

export const issueAttachments = pgTable('issue_attachments', {
  id:                uuid().defaultRandom().primaryKey().notNull(),
  issueBoardStateId: uuid('issue_board_state_id').references(() => issueBoardStates.id, { onDelete: 'cascade' }).notNull(),
  userId:            uuid('user_id').notNull(),
  url:               text('url').notNull(),
  fileName:          text('file_name').notNull(),
  contentType:       text('content_type'),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('issue_attachments_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_attachments_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_attachments_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
