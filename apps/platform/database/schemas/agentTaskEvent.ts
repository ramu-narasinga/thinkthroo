import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { agentTasks } from './agentTask';

// Structured tool-call transcript events, additive alongside agent_task_logs.
// Only populated for implementation-task runs (see apps/daemon/src/executor.ts).
export const agentTaskEvents = pgTable('agent_task_events', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  taskId: uuid('task_id').references(() => agentTasks.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(),
  // 'agent_text' | 'tool_call' | 'tool_result' | 'error'
  eventType: text('event_type').notNull(),
  toolName: text('tool_name'),
  toolUseId: text('tool_use_id'),
  toolInput: text('tool_input'), // JSON-encoded
  preview: text('preview'),
  raw: text('raw'), // full JSON line, for expand-to-full-detail
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
