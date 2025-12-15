import { DocumentItem } from '@/database/schemas';

/**
 * Get selected document
 */
export const selectedDocumentSelector = (s: { 
  documents: DocumentItem[]; 
  selectedDocumentId: string | null 
}) => {
  return s.documents.find((doc) => doc.id === s.selectedDocumentId) || null;
};

/**
 * Get all files (excluding folders)
 */
export const filesSelector = (s: { documents: DocumentItem[] }) => {
  return s.documents.filter((doc) => doc.type === 'file');
};

/**
 * Get all folders
 */
export const foldersSelector = (s: { documents: DocumentItem[] }) => {
  return s.documents.filter((doc) => doc.type === 'folder');
};

/**
 * Check if any operation is in progress
 */
export const isAnyOperationInProgressSelector = (s: {
  creatingIds: string[];
  updatingIds: string[];
  deletingIds: string[];
  isLoading: boolean;
}) => {
  return (
    s.isLoading ||
    s.creatingIds.length > 0 ||
    s.updatingIds.length > 0 ||
    s.deletingIds.length > 0
  );
};
