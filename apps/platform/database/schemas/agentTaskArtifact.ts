import { pgTable, uuid, text, timestamp, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { agentTasks } from './agentTask';

export const agentTaskArtifacts = pgTable('agent_task_artifacts', {
  id:          uuid().defaultRandom().primaryKey().notNull(),
  taskId:      uuid('task_id').references(() => agentTasks.id, { onDelete: 'cascade' }).notNull(),
  userId:      uuid('user_id').notNull(),
  type:        text('type').notNull(), // 'screenshot' | 'video' | 'trace'
  url:         text('url').notNull(),  // Supabase Storage public URL
  filename:    text('filename').notNull(),
  capturedAt:  timestamp('captured_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  pgPolicy('agent_task_artifacts_select', {
    as: 'permissive', for: 'select', to: ['authenticated'],
    using: sql`(auth.uid() = ${table.userId})`,
  }),
  pgPolicy('agent_task_artifacts_insert', {
    as: 'permissive', for: 'insert', to: ['authenticated'],
    withCheck: sql`(auth.uid() = ${table.userId})`,
  }),
]);
