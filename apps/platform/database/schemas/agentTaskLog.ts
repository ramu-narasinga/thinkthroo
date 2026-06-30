import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { agentTasks } from './agentTask';

export const agentTaskLogs = pgTable('agent_task_logs', {
  id: uuid().defaultRandom().primaryKey().notNull(),
  taskId: uuid('task_id').references(() => agentTasks.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(), // 'info' | 'output' | 'error'
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
