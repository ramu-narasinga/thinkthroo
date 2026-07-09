import { pgTable, uuid, text, integer, timestamp, unique, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repository';
import { squads } from './squad';

export const issueBoardStates = pgTable('issue_board_states', {
  id:           uuid().defaultRandom().primaryKey().notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  userId:       uuid('user_id').notNull(),
  issueNumber:  integer('issue_number').notNull(),
  issueTitle:   text('issue_title').notNull(),
  issueHtmlUrl: text('issue_html_url'),

  // 'backlog' | 'planning' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked' | 'waiting_for_user'
  kanbanStatus: text('kanban_status').notNull().default('backlog'),

  // 'no_priority' | 'urgent' | 'high' | 'medium' | 'low'
  priority: text('priority').notNull().default('no_priority'),

  // 'plan' | 'auto_accept_edits' | 'ask_before_edits' | 'auto' — chosen at creation, editable.
  executionMode: text('execution_mode').notNull().default('auto_accept_edits'),

  // Multi-assignee (agent/member) lives in issue_assignees. Squad assignment stays single-select here.
  assigneeSquadId: uuid('assignee_squad_id').references(() => squads.id, { onDelete: 'set null' }),

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
