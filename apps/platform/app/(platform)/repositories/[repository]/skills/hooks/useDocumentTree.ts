"use client";

import { useMemo } from 'react';
import { useDocumentStore } from '@/store/document';
import { buildDocumentTree } from '../utils/documentTree';

/**
 * Hook to manage document tree structure and expansion state
 */
export function useDocumentTree() {
  const documents = useDocumentStore((s) => s.documents);
  const expandedFolderIds = useDocumentStore((s) => s.expandedFolderIds);
  const toggleFolder = useDocumentStore((s) => s.toggleFolder);
  const expandFolder = useDocumentStore((s) => s.expandFolder);
  const collapseFolder = useDocumentStore((s) => s.collapseFolder);

  // Build tree structure from flat documents array
  const tree = useMemo(() => buildDocumentTree(documents), [documents]);

  // Helper to check if a folder is expanded
  const isFolderExpanded = (id: string) => expandedFolderIds.has(id);

  return {
    tree,
    expandedFolderIds,
    toggleFolder,
    expandFolder,
    collapseFolder,
    isFolderExpanded,
  };
}
