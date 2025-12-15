import { isNotNull } from 'drizzle-orm';
import {
  AnyPgColumn,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { sql } from 'drizzle-orm';

import { repositories } from './repository';
import { users as authUsers } from './auth';
import { asyncTasks } from './asyncTask';

/**
 * Documents table - Stores architecture documentation files and folders
 * 
 * Key features:
 * - Links to repositories for organizing docs by codebase
 * - Supports folder hierarchy via parentId (self-referencing)
 * - Stores TipTap editor content for rich text documentation
 * - Tracks chunking and embedding tasks for RAG processing
 */
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),

    // Repository association
    repositoryId: uuid('repository_id')
      .references(() => repositories.id, { onDelete: 'cascade' })
      .notNull(),

    // User association
    userId: uuid('user_id')
      .references(() => authUsers.id, { onDelete: 'cascade' })
      .notNull(),

    // Parent document (for folder hierarchy structure)
    parentId: uuid('parent_id').references(
      (): AnyPgColumn => documents.id,
      { onDelete: 'cascade' }
    ),

    // Basic information
    name: text('name').notNull(),
    
    // Type: 'file' or 'folder'
    type: text('type', { enum: ['file', 'folder'] }).notNull(),

    // Document content (TipTap editor content - HTML/text)
    content: text('content'),

    // Editor state (TipTap JSON format)
    editorData: jsonb('editor_data').$type<Record<string, any>>(),

    // Metadata for architecture concepts
    metadata: jsonb('metadata').$type<{
      description?: string;
      tags?: string[];
      architectureType?: string; // e.g., 'api-layer', 'state-management', 'components'
      [key: string]: any;
    }>(),

    // Statistics (populated when content is saved)
    totalCharCount: integer('total_char_count').default(0),
    totalLineCount: integer('total_line_count').default(0),

    // Client ID for optimistic updates/deduplication
    clientId: text('client_id'),

    // Slug for URL-friendly access
    slug: varchar('slug', { length: 255 }),

    // Async task tracking for chunking and embedding
    chunkTaskId: uuid('chunk_task_id').references(() => asyncTasks.id, {
      onDelete: 'set null',
    }),
    embeddingTaskId: uuid('embedding_task_id').references(() => asyncTasks.id, {
      onDelete: 'set null',
    }),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    // Indexes for performance
    index('documents_repository_id_idx').on(table.repositoryId),
    index('documents_user_id_idx').on(table.userId),
    index('documents_parent_id_idx').on(table.parentId),
    index('documents_type_idx').on(table.type),
    index('documents_chunk_task_id_idx').on(table.chunkTaskId),
    index('documents_embedding_task_id_idx').on(table.embeddingTaskId),
    
    // Unique constraints
    uniqueIndex('documents_client_id_user_id_unique').on(table.clientId, table.userId),
    uniqueIndex('documents_slug_repository_id_unique')
      .on(table.slug, table.repositoryId)
      .where(isNotNull(table.slug)),
    
    // Type check constraint
    check('documents_type_check', sql`type = ANY (ARRAY['file'::text, 'folder'::text])`),
    
    // RLS Policies
    pgPolicy('users can view their own documents', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can insert their own documents', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can update their own documents', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can delete their own documents', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

export type NewDocument = typeof documents.$inferInsert;
export type DocumentItem = typeof documents.$inferSelect;
export const insertDocumentSchema = createInsertSchema(documents);