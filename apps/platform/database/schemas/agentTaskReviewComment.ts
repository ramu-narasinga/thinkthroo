import { pgTable, uuid, text, integer, bigint, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { agentTasks } from './agentTask';
import { repositories } from './repository';

export const agentTaskReviewComments = pgTable('agent_task_review_comments', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  taskId: uuid('task_id').references(() => agentTasks.id, { onDelete: 'cascade' }).notNull(),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(),
  issueNumber: integer('issue_number'),
  // '__summary__' with startLine=0 for the top-level review summary row
  filename: text('filename').notNull(),
  startLine: integer('start_line').notNull(),
  endLine: integer('end_line'),
  body: text('body').notNull(),
  // 'error' | 'warning' | 'suggestion' | 'summary'
  severity: text('severity').default('suggestion').notNull(),
  // 'agent' | 'user'
  authorType: text('author_type').default('agent').notNull(),
  // Self-referential: non-null when this is a user reply to an agent comment
  parentCommentId: uuid('parent_comment_id'),
  // GitHub's PR review comment id — populated after posting to GitHub
  githubCommentId: bigint('github_comment_id', { mode: 'number' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('agent_task_review_comments_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('agent_task_review_comments_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('agent_task_review_comments_update', {
    as: 'permissive', for: 'update', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
