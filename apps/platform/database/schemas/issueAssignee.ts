import { pgTable, uuid, text, timestamp, unique, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { issueBoardStates } from './issueBoardState';
import { agents } from './agent';
import { teamInvitations } from './teamInvitation';

export const issueAssignees = pgTable('issue_assignees', {
  id:                uuid().defaultRandom().primaryKey().notNull(),
  issueBoardStateId: uuid('issue_board_state_id').references(() => issueBoardStates.id, { onDelete: 'cascade' }).notNull(),
  userId:            uuid('user_id').notNull(),
  assigneeType:      text('assignee_type').notNull(), // 'agent' | 'member'
  assigneeAgentId:   uuid('assignee_agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  assigneeMemberId:  uuid('assignee_member_id').references(() => teamInvitations.id, { onDelete: 'set null' }),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('issue_assignees_board_agent_unique').on(table.issueBoardStateId, table.assigneeType, table.assigneeAgentId),
  unique('issue_assignees_board_member_unique').on(table.issueBoardStateId, table.assigneeType, table.assigneeMemberId),
  pgPolicy('issue_assignees_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_assignees_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_assignees_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
