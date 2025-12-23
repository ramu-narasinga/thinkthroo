"use client";

import { useCallback, useState } from 'react';
import { useDocumentStore } from '@/store/document';
import { toast } from 'sonner';
import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';

export interface CreateDocumentInput {
  repositoryId: string;
  parentId?: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
}

export interface UpdateDocumentInput {
  name?: string;
  content?: string;
  editorData?: Record<string, any>;
}

/**
 * Hook for document mutations (create, update, delete)
 */
export function useDocumentMutations() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createDocument = useDocumentStore((s) => s.createDocument);
  const updateDocument = useDocumentStore((s) => s.updateDocument);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);

  const handleCreate = useCallback(
    async (input: CreateDocumentInput) => {
      setIsCreating(true);
      
      Sentry.addBreadcrumb({
        category: 'document',
        message: `Creating ${input.type}`,
        level: 'info',
        data: {
          name: input.name,
          type: input.type,
          repository_id: input.repositoryId,
          has_parent: !!input.parentId,
        },
      });
      Sentry.logger.info(
        Sentry.logger.fmt`Creating document: ${input.name} (${input.type})`,
        {
          name: input.name,
          type: input.type,
          repository_id: input.repositoryId,
          has_parent: !!input.parentId,
          timestamp: new Date().toISOString(),
        }
      );
      
      try {
        const document = await createDocument(input);
        toast.success(`${input.type === 'file' ? 'File' : 'Folder'} created successfully`);

        // PostHog: Track document created
        posthog.capture('document_created', {
          document_type: input.type,
          document_name: input.name,
          repository_id: input.repositoryId,
          has_parent: !!input.parentId,
        });
        
        Sentry.addBreadcrumb({
          category: 'document',
          message: 'Document created successfully',
          level: 'info',
          data: {
            document_id: document.id,
            type: input.type,
          },
        });
        Sentry.logger.info(
          Sentry.logger.fmt`Document created: ${document.id} (${input.type})`,
          {
            document_id: document.id,
            type: input.type,
            repository_id: input.repositoryId,
            timestamp: new Date().toISOString(),
          }
        );

        return document;
      } catch (error: any) {
        Sentry.captureException(error, {
          tags: {
            hook: 'useDocumentMutations',
            action: 'create',
            document_type: input.type,
          },
          contexts: {
            document: {
              name: input.name,
              type: input.type,
              repository_id: input.repositoryId,
              has_parent: !!input.parentId,
            },
          },
        });
        Sentry.logger.error(
          Sentry.logger.fmt`Failed to create document: ${input.name} (${input.type}) - ${error?.message}`,
          {
            name: input.name,
            type: input.type,
            repository_id: input.repositoryId,
            error_message: error?.message,
            timestamp: new Date().toISOString(),
          }
        );
        
        console.error('[useDocumentMutations] Create error:', error);
        toast.error(error?.message || 'Failed to create document');
        posthog.captureException(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [createDocument]
  );

  const handleUpdate = useCallback(
    async (id: string, input: UpdateDocumentInput) => {
      setIsUpdating(true);
      
      Sentry.addBreadcrumb({
        category: 'document',
        message: 'Updating document',
        level: 'info',
        data: {
          document_id: id,
          has_name_change: !!input.name,
          has_content_change: !!input.content,
        },
      });
      Sentry.logger.info(
        Sentry.logger.fmt`Updating document: ${id}`,
        {
          document_id: id,
          update_fields: Object.keys(input),
          timestamp: new Date().toISOString(),
        }
      );
      
      try {
        const document = await updateDocument(id, input);
        toast.success('Document updated successfully');
        
        Sentry.addBreadcrumb({
          category: 'document',
          message: 'Document updated successfully',
          level: 'info',
          data: { document_id: id },
        });
        Sentry.logger.info(
          Sentry.logger.fmt`Document updated: ${id}`,
          {
            document_id: id,
            update_fields: Object.keys(input),
            timestamp: new Date().toISOString(),
          }
        );
        
        return document;
      } catch (error: any) {
        Sentry.captureException(error, {
          tags: {
            hook: 'useDocumentMutations',
            action: 'update',
          },
          contexts: {
            document: {
              document_id: id,
              update_fields: Object.keys(input),
            },
          },
        });
        Sentry.logger.error(
          Sentry.logger.fmt`Failed to update document: ${id} - ${error?.message}`,
          {
            document_id: id,
            update_fields: Object.keys(input),
            error_message: error?.message,
            timestamp: new Date().toISOString(),
          }
        );
        
        console.error('[useDocumentMutations] Update error:', error);
        toast.error(error?.message || 'Failed to update document');
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateDocument]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      
      Sentry.addBreadcrumb({
        category: 'document',
        message: 'Deleting document',
        level: 'info',
        data: { document_id: id },
      });
      Sentry.logger.info(
        Sentry.logger.fmt`Deleting document: ${id}`,
        {
          document_id: id,
          timestamp: new Date().toISOString(),
        }
      );
      
      try {
        await deleteDocument(id);
        toast.success('Document deleted successfully');

        // PostHog: Track document deleted
        posthog.capture('document_deleted', {
          document_id: id,
        });
        
        Sentry.addBreadcrumb({
          category: 'document',
          message: 'Document deleted successfully',
          level: 'info',
          data: { document_id: id },
        });
        Sentry.logger.info(
          Sentry.logger.fmt`Document deleted: ${id}`,
          {
            document_id: id,
            timestamp: new Date().toISOString(),
          }
        );
      } catch (error: any) {
        Sentry.captureException(error, {
          tags: {
            hook: 'useDocumentMutations',
            action: 'delete',
          },
          contexts: {
            document: {
              document_id: id,
            },
          },
        });
        Sentry.logger.error(
          Sentry.logger.fmt`Failed to delete document: ${id} - ${error?.message}`,
          {
            document_id: id,
            error_message: error?.message,
            timestamp: new Date().toISOString(),
          }
        );
        
        console.error('[useDocumentMutations] Delete error:', error);
        toast.error(error?.message || 'Failed to delete document');
        posthog.captureException(error);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteDocument]
  );

  return {
    createDocument: handleCreate,
    updateDocument: handleUpdate,
    deleteDocument: handleDelete,
    isCreating,
    isUpdating,
    isDeleting,
  };
}
