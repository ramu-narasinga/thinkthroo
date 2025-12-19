"use client";

import { useCallback, useState } from 'react';
import { useDocumentStore } from '@/store/document';
import { toast } from 'sonner';
import posthog from 'posthog-js';

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

        return document;
      } catch (error: any) {
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
      try {
        const document = await updateDocument(id, input);
        toast.success('Document updated successfully');
        return document;
      } catch (error: any) {
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
      try {
        await deleteDocument(id);
        toast.success('Document deleted successfully');

        // PostHog: Track document deleted
        posthog.capture('document_deleted', {
          document_id: id,
        });
      } catch (error: any) {
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
