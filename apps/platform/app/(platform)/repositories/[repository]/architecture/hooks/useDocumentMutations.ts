"use client";

import { useCallback, useState } from 'react';
import { useDocumentStore } from '@/store/document';
import { toast } from 'sonner';

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
        return document;
      } catch (error: any) {
        console.error('[useDocumentMutations] Create error:', error);
        toast.error(error?.message || 'Failed to create document');
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
      } catch (error: any) {
        console.error('[useDocumentMutations] Delete error:', error);
        toast.error(error?.message || 'Failed to delete document');
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
