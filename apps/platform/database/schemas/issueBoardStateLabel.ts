import { pgTable, uuid, timestamp, unique, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { issueBoardStates } from './issueBoardState';
import { issueLabels } from './issueLabel';

export const issueBoardStateLabels = pgTable('issue_board_state_labels', {
  id:                uuid().defaultRandom().primaryKey().notNull(),
  issueBoardStateId: uuid('issue_board_state_id').references(() => issueBoardStates.id, { onDelete: 'cascade' }).notNull(),
  labelId:           uuid('label_id').references(() => issueLabels.id, { onDelete: 'cascade' }).notNull(),
  userId:            uuid('user_id').notNull(),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('issue_board_state_labels_pair_unique').on(table.issueBoardStateId, table.labelId),
  pgPolicy('issue_board_state_labels_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_board_state_labels_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_board_state_labels_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
