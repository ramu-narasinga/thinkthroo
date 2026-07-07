import { pgTable, uuid, text, integer, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { repositories } from './repository';
import { agentTasks } from './agentTask';

export const issueComments = pgTable('issue_comments', {
  id:           uuid().defaultRandom().primaryKey().notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  issueNumber:  integer('issue_number').notNull(),
  userId:       uuid('user_id').notNull(),
  authorType:   text('author_type').notNull(), // 'user' | 'agent'
  agentTaskId:  uuid('agent_task_id').references(() => agentTasks.id, { onDelete: 'set null' }),
  body:         text('body').notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('issue_comments_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('issue_comments_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
]);
