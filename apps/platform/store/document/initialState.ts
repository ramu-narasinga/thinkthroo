import { DocumentItem } from '@/database/schemas';

export interface DocumentStoreState {
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  expandedFolderIds: Set<string>;
  isLoading: boolean;
  isFirstFetchFinished: boolean;
  // For tracking operations in progress
  creatingIds: string[];
  updatingIds: string[];
  deletingIds: string[];
}

export const initialState: DocumentStoreState = {
  documents: [],
  selectedDocumentId: null,
  expandedFolderIds: new Set(),
  isLoading: false,
  isFirstFetchFinished: false,
  creatingIds: [],
  updatingIds: [],
  deletingIds: [],
};
