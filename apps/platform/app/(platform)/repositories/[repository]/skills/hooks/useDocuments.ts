"use client";

import { useEffect } from 'react';
import { useDocumentStore } from '@/store/document';

/**
 * Hook to fetch and manage documents for a repository
 * Automatically fetches documents on mount
 */
export function useDocuments(repositoryId: string) {
  const documents = useDocumentStore((s) => s.documents);
  const isLoading = useDocumentStore((s) => s.isLoading);
  const isFirstFetchFinished = useDocumentStore((s) => s.isFirstFetchFinished);
  const fetchDocuments = useDocumentStore((s) => s.fetchDocuments);
  const clearDocuments = useDocumentStore((s) => s.clearDocuments);

  useEffect(() => {
    if (repositoryId) {
      fetchDocuments(repositoryId);
    }

    return () => {
      // Clear documents when unmounting or switching repositories
      clearDocuments();
    };
  }, [repositoryId, fetchDocuments, clearDocuments]);

  return {
    documents,
    isLoading,
    isFirstFetchFinished,
    refetch: () => fetchDocuments(repositoryId),
  };
}
