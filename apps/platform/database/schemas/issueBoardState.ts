import { pgTable, uuid, text, integer, timestamp, unique, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repository';
import { agents } from './agent';

export const issueBoardStates = pgTable('issue_board_states', {
  id:           uuid().defaultRandom().primaryKey().notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  userId:       uuid('user_id').notNull(),
  issueNumber:  integer('issue_number').notNull(),
  issueTitle:   text('issue_title').notNull(),
  issueHtmlUrl: text('issue_html_url'),

  // 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked'
  kanbanStatus: text('kanban_status').notNull().default('backlog'),

  // Assignee — 'agent' | 'member' | null (unassigned)
  assigneeType:     text('assignee_type'),
  assigneeAgentId:  uuid('assignee_agent_id').references(() => agents.id, { onDelete: 'set null' }),
  assigneeMemberId: uuid('assignee_member_id'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique('issue_board_states_repo_issue_unique').on(table.repositoryId, table.issueNumber),
  pgPolicy('issue_board_states_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_board_states_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_board_states_update', {
    as: 'permissive', for: 'update', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_board_states_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
