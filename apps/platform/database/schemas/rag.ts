import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
  varchar,
  vector,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { createdAt, timestamps } from './_helpers';
import { documents } from './file';
import { profiles } from './user';

/**
 * Chunks table - Stores composite/processed chunks ready for RAG retrieval
 * These are the main chunks that will be searched via vector similarity
 */
export const chunks = pgTable(
  'chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Chunk content (required)
    text: text('text').notNull(),
    
    // Optional summary/abstract of the chunk for better retrieval
    abstract: text('abstract'),
    
    // Metadata about the chunk
    metadata: jsonb('metadata').$type<{
      startLine?: number;
      endLine?: number;
      tokens?: number;
      architectureType?: string;
      [key: string]: any;
    }>(),
    
    // Index in the original document (required for ordering)
    index: integer('index').notNull(),
    
    // Type of chunk (e.g., 'paragraph', 'code', 'heading')
    type: varchar('type'),

    // Client ID for deduplication
    clientId: text('client_id'),
    
    // User association
    userId: uuid('user_id')
      .references(() => profiles.userId, { onDelete: 'cascade' })
      .notNull(),

    ...timestamps,
  },
  (t) => [
    uniqueIndex('chunks_client_id_user_id_unique').on(t.clientId, t.userId),
    index('chunks_user_id_idx').on(t.userId),
    pgPolicy('users can view their own chunks', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can insert their own chunks', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can update their own chunks', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can delete their own chunks', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

export type NewChunkItem = typeof chunks.$inferInsert & { documentId?: string };
export type ChunkItem = typeof chunks.$inferSelect;

/**
 * Unstructured chunks table - Raw chunks directly from chunking services
 * These represent the initial chunking output before any processing
 * 
 * Purpose:
 * - Debugging: see exactly how content was chunked
 * - Re-processing: can re-create composite chunks without re-chunking
 * - Traceability: track which chunking method was used
 * - Provenance: know which part of document each chunk came from
 */
export const unstructuredChunks = pgTable(
  'unstructured_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Raw chunk text (required)
    text: text('text').notNull(),
    
    // Metadata from the chunking process
    metadata: jsonb('metadata').$type<{
      chunkMethod?: string; // e.g., 'recursive', 'semantic', 'fixed-size'
      overlap?: number;
      [key: string]: any;
    }>(),
    
    // Position in original document (required)
    index: integer('index').notNull(),
    
    // Type of chunk
    type: varchar('type'),

    ...timestamps,

    // Parent ID for hierarchical chunks
    parentId: varchar('parent_id'),
    
    // Reference to the composite chunk (many unstructured -> one composite)
    compositeId: uuid('composite_id').references(() => chunks.id, { 
      onDelete: 'cascade' 
    }),
    
    // Client ID for deduplication
    clientId: text('client_id'),
    
    // User association
    userId: uuid('user_id')
      .references(() => profiles.userId, { onDelete: 'cascade' })
      .notNull(),
    
    // Document association (links to documents, not files)
    documentId: uuid('document_id')
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    clientIdUnique: uniqueIndex('unstructured_chunks_client_id_user_id_unique').on(
      t.clientId,
      t.userId
    ),
    documentIdIdx: index('unstructured_chunks_document_id_idx').on(t.documentId),
    userIdIdx: index('unstructured_chunks_user_id_idx').on(t.userId),
    compositeIdIdx: index('unstructured_chunks_composite_id_idx').on(t.compositeId),
    canViewOwnChunks: pgPolicy('users can view their own unstructured chunks', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    canInsertOwnChunks: pgPolicy('users can insert their own unstructured chunks', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    canUpdateOwnChunks: pgPolicy('users can update their own unstructured chunks', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    canDeleteOwnChunks: pgPolicy('users can delete their own unstructured chunks', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
  })
);

export type NewUnstructuredChunkItem = typeof unstructuredChunks.$inferInsert;
export type UnstructuredChunkItem = typeof unstructuredChunks.$inferSelect;

/**
 * Embeddings table - Vector embeddings for semantic search
 * One-to-one relationship with chunks
 */
export const embeddings = pgTable(
  'embeddings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Reference to the chunk being embedded (unique, one-to-one)
    chunkId: uuid('chunk_id')
      .references(() => chunks.id, { onDelete: 'cascade' })
      .unique()
      .notNull(),
    
    // Vector embedding
    // Adjust dimensions based on your model:
    // - OpenAI text-embedding-3-small: 1536
    // - OpenAI text-embedding-3-large: 3072
    // - Cohere embed-english-v3.0: 1024
    // - sentence-transformers: 768
    embeddings: vector('embeddings', { dimensions: 1024 }),
    
    // Model used for embedding (required for consistency)
    model: text('model').notNull(),
    
    // Client ID for deduplication
    clientId: text('client_id'),
    
    // User association
    userId: uuid('user_id')
      .references(() => profiles.userId, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => [
    uniqueIndex('embeddings_client_id_user_id_unique').on(t.clientId, t.userId),
    // Improve delete embeddings query performance
    index('embeddings_chunk_id_idx').on(t.chunkId),
    index('embeddings_user_id_idx').on(t.userId),
    pgPolicy('users can view their own embeddings', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can insert their own embeddings', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can update their own embeddings', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can delete their own embeddings', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

export type NewEmbeddingsItem = typeof embeddings.$inferInsert;
export type EmbeddingsSelectItem = typeof embeddings.$inferSelect;

/**
 * Document chunks table - Maps documents to their chunks
 * Junction table for many-to-many relationship
 * 
 * Purpose:
 * - Know which chunks came from which document
 * - Filter RAG searches by specific documents
 * - Track chunk lineage for citations
 */
export const documentChunks = pgTable(
  'document_chunks',
  {
    // Document reference
    documentId: uuid('document_id')
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),

    // Chunk reference
    chunkId: uuid('chunk_id')
      .references(() => chunks.id, { onDelete: 'cascade' })
      .notNull(),

    // Optional: page/section index if document has pages
    pageIndex: integer('page_index'),

    // User association
    userId: uuid('user_id')
      .references(() => profiles.userId, { onDelete: 'cascade' })
      .notNull(),

    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.documentId, t.chunkId] }),
    index('document_chunks_document_id_idx').on(t.documentId),
    index('document_chunks_chunk_id_idx').on(t.chunkId),
    pgPolicy('users can view their own document chunks', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can insert their own document chunks', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('users can delete their own document chunks', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
  ]
);

export type NewDocumentChunk = typeof documentChunks.$inferInsert;
export type DocumentChunkItem = typeof documentChunks.$inferSelect;