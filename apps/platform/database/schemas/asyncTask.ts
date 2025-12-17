import { integer, jsonb, pgTable, text, uuid, pgPolicy, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { timestamps } from './_helpers';
import { profiles } from './user';

/**
 * Async Tasks table - Tracks background processing tasks (chunking, embedding, etc.)
 * 
 * Purpose:
 * - Track status of long-running operations
 * - Show progress to users in UI
 * - Enable retry logic for failed tasks
 * - Measure performance with duration metrics
 */
export const asyncTasks = pgTable('async_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Task type: 'chunking' | 'embedding' | 'document_processing'
  type: text('type', { 
    enum: ['chunking', 'embedding', 'document_processing'] 
  }).notNull(),

  // Task status: 'pending' | 'processing' | 'success' | 'error'
  status: text('status', { 
    enum: ['pending', 'processing', 'success', 'error'] 
  }).notNull().default('pending'),
  
  // Error information if task fails
  error: jsonb('error').$type<{
    name?: string;
    message: string;
    stack?: string;
    body?: any;
  }>(),

  // Task result/metadata
  result: jsonb('result').$type<{
    chunksCreated?: number;
    embeddingsCreated?: number;
    [key: string]: any;
  }>(),

  // User association
  userId: uuid('user_id')
    .references(() => profiles.userId, { onDelete: 'cascade' })
    .notNull(),
  
  // Duration in milliseconds
  duration: integer('duration'),

  ...timestamps,
}, (table) => [
  index('async_tasks_user_id_idx').on(table.userId),
  index('async_tasks_status_idx').on(table.status),
  pgPolicy('users can view their own async tasks', {
    as: 'permissive',
    for: 'select',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can insert their own async tasks', {
    as: 'permissive',
    for: 'insert',
    to: ['authenticated'],
    withCheck: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can update their own async tasks', {
    as: 'permissive',
    for: 'update',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
  pgPolicy('users can delete their own async tasks', {
    as: 'permissive',
    for: 'delete',
    to: ['authenticated'],
    using: sql`(auth.uid() = user_id)`,
  }),
]);

export type NewAsyncTaskItem = typeof asyncTasks.$inferInsert;
export type AsyncTaskSelectItem = typeof asyncTasks.$inferSelect;

// Enums for type safety in application code
export enum AsyncTaskStatus {
  Pending = 'pending',
  Processing = 'processing',
  Success = 'success',
  Error = 'error',
}

export enum AsyncTaskType {
  Chunking = 'chunking',
  Embedding = 'embedding',
  DocumentProcessing = 'document_processing',
}
