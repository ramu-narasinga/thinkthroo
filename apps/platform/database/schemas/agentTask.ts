import { pgTable, uuid, text, integer, boolean, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { agents } from './agent';
import { daemonRuntimes } from './daemonRuntime';
import { repositories } from './repository';

export const agentTasks = pgTable('agent_tasks', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }).notNull(),
  runtimeId: uuid('runtime_id').references(() => daemonRuntimes.id, { onDelete: 'set null' }),
  repositoryId: uuid('repository_id').references(() => repositories.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(),

  // Trigger context
  issueNumber: integer('issue_number'),
  issueTitle: text('issue_title'),
  issueBody: text('issue_body'),
  issueHtmlUrl: text('issue_html_url'),

  // Lifecycle — 'queued' | 'dispatched' | 'waiting_local_directory' | 'running' | 'completed' | 'failed' | 'cancelled'
  status: text('status').notNull().default('queued'),
  failureReason: text('failure_reason'),
  result: text('result'),       // JSON: { prUrl, summary, branchName }
  waitReason: text('wait_reason'),

  // Session resumption
  sessionId: text('session_id'),
  workDir: text('work_dir'),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
  priority: integer('priority').notNull().default(0),

  // Retry (max 2 attempts)
  attemptCount: integer('attempt_count').notNull().default(0),
  forceFreshSession: boolean('force_fresh_session').notNull().default(false),

  // Two-phase workflow: user message when re-triggering (null = planning phase, present = implementing phase)
  userMessage: text('user_message'),

  // Token usage (accumulated across streaming calls)
  inputTokens: integer('input_tokens').notNull().default(0),
  outputTokens: integer('output_tokens').notNull().default(0),
  cacheReadTokens: integer('cache_read_tokens').notNull().default(0),
  cacheWriteTokens: integer('cache_write_tokens').notNull().default(0),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  pgPolicy('agent_tasks_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('agent_tasks_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('agent_tasks_update', {
    as: 'permissive', for: 'update', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('agent_tasks_delete', {
    as: 'permissive', for: 'delete', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
]);
