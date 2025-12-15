import { StateCreator } from 'zustand/vanilla';
import { DocumentStore } from '../../store';
import { documentClientService } from '@/service/document';
import { DocumentItem } from '@/database/schemas';

export interface CreateDocumentInput {
  repositoryId: string;
  parentId?: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  editorData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateDocumentInput {
  name?: string;
  content?: string;
  editorData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DocumentAction {
  /**
   * Fetch all documents for a repository
   */
  fetchDocuments: (repositoryId: string) => Promise<void>;

  /**
   * Fetch full document data by ID (includes content and editorData)
   */
  fetchDocumentById: (id: string) => Promise<DocumentItem>;

  /**
   * Create a new document (file or folder)
   */
  createDocument: (input: CreateDocumentInput) => Promise<DocumentItem>;

  /**
   * Update a document
   */
  updateDocument: (id: string, input: UpdateDocumentInput) => Promise<DocumentItem>;

  /**
   * Delete a document
   */
  deleteDocument: (id: string) => Promise<void>;

  /**
   * Select a document
   */
  selectDocument: (id: string | null) => void;

  /**
   * Toggle folder expansion
   */
  toggleFolder: (id: string) => void;

  /**
   * Expand a folder
   */
  expandFolder: (id: string) => void;

  /**
   * Collapse a folder
   */
  collapseFolder: (id: string) => void;

  /**
   * Clear all documents (when switching repositories)
   */
  clearDocuments: () => void;

  /**
   * Internal: update documents list
   */
  internal_updateDocuments: (documents: DocumentItem[]) => void;

  /**
   * Internal: add a single document to the list
   */
  internal_addDocument: (document: DocumentItem) => void;

  /**
   * Internal: update a single document in the list
   */
  internal_updateSingleDocument: (id: string, updates: Partial<DocumentItem>) => void;

  /**
   * Internal: remove a document from the list
   */
  internal_removeDocument: (id: string) => void;
}

export const createDocumentSlice: StateCreator<
  DocumentStore,
  [['zustand/devtools', never]],
  [],
  DocumentAction
> = (set, get) => ({
  fetchDocuments: async (repositoryId: string) => {
    set({ isLoading: true }, false, 'fetchDocuments/start');

    try {
      // Use minimal endpoint to reduce payload size
      const documents = await documentClientService.getAllByRepositoryMinimal(repositoryId);

      // Cast to DocumentItem[] since we know the structure (just missing content/editorData)
      get().internal_updateDocuments(documents as DocumentItem[]);

      // Auto-select first file if none selected
      if (!get().selectedDocumentId) {
        const firstFile = documents.find((doc) => doc.type === 'file');
        if (firstFile) {
          // Fetch full document data when selecting
          await get().fetchDocumentById(firstFile.id);
          get().selectDocument(firstFile.id);
        }
      }

      set(
        { isLoading: false, isFirstFetchFinished: true },
        false,
        'fetchDocuments/success'
      );
    } catch (error) {
      console.error('[DocumentStore] Error fetching documents:', error);
      set({ isLoading: false }, false, 'fetchDocuments/error');
      throw error;
    }
  },

  fetchDocumentById: async (id: string) => {
    try {
      const document = await documentClientService.getById(id);

      if (document) {
        // Update the document in store with full data
        get().internal_updateSingleDocument(id, document);
        return document;
      }

      throw new Error(`Document with id ${id} not found`);
    } catch (error) {
      console.error('[DocumentStore] Error fetching document:', error);
      throw error;
    }
  },

  createDocument: async (input: CreateDocumentInput) => {
    const tempId = `temp-${Date.now()}`;
    set(
      (state) => ({ creatingIds: [...state.creatingIds, tempId] }),
      false,
      'createDocument/start'
    );

    try {
      const document = await documentClientService.create(input);

      get().internal_addDocument(document);

      // Auto-select if it's a file, or expand if it's a folder
      if (document.type === 'file') {
        get().selectDocument(document.id);
      } else {
        get().expandFolder(document.id);
      }

      // Expand parent folder if exists
      if (input.parentId) {
        get().expandFolder(input.parentId);
      }

      set(
        (state) => ({
          creatingIds: state.creatingIds.filter((id) => id !== tempId),
        }),
        false,
        'createDocument/success'
      );

      return document;
    } catch (error) {
      console.error('[DocumentStore] Error creating document:', error);
      set(
        (state) => ({
          creatingIds: state.creatingIds.filter((id) => id !== tempId),
        }),
        false,
        'createDocument/error'
      );
      throw error;
    }
  },

  updateDocument: async (id: string, input: UpdateDocumentInput) => {
    set(
      (state) => ({ updatingIds: [...state.updatingIds, id] }),
      false,
      'updateDocument/start'
    );

    try {
      const document = await documentClientService.update(id, input);

      get().internal_updateSingleDocument(id, document);

      set(
        (state) => ({
          updatingIds: state.updatingIds.filter((updateId) => updateId !== id),
        }),
        false,
        'updateDocument/success'
      );

      return document;
    } catch (error) {
      console.error('[DocumentStore] Error updating document:', error);
      set(
        (state) => ({
          updatingIds: state.updatingIds.filter((updateId) => updateId !== id),
        }),
        false,
        'updateDocument/error'
      );
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    set(
      (state) => ({ deletingIds: [...state.deletingIds, id] }),
      false,
      'deleteDocument/start'
    );

    try {
      await documentClientService.delete(id);

      // If deleted document was selected, select another file
      if (get().selectedDocumentId === id) {
        const remainingFiles = get().documents.filter(
          (doc) => doc.type === 'file' && doc.id !== id
        );
        get().selectDocument(remainingFiles[0]?.id || null);
      }

      get().internal_removeDocument(id);

      set(
        (state) => ({
          deletingIds: state.deletingIds.filter((deleteId) => deleteId !== id),
        }),
        false,
        'deleteDocument/success'
      );
    } catch (error) {
      console.error('[DocumentStore] Error deleting document:', error);
      set(
        (state) => ({
          deletingIds: state.deletingIds.filter((deleteId) => deleteId !== id),
        }),
        false,
        'deleteDocument/error'
      );
      throw error;
    }
  },

  selectDocument: (id: string | null) => {
    console.log("Selecting document:", id);
    
    // Fetch full document data when selecting (in background)
    if (id) {
      const document = get().documents.find(doc => doc.id === id);
      // Only fetch if document doesn't have content/editorData yet
      if (document && !document.content && document.type === 'file') {
        get().fetchDocumentById(id).catch(err => {
          console.error('[DocumentStore] Error fetching document on select:', err);
        });
      }
    }
    
    set({ selectedDocumentId: id }, false, 'selectDocument');
  },

  toggleFolder: (id: string) => {
    set(
      (state) => {
        const expanded = new Set(state.expandedFolderIds);
        if (expanded.has(id)) {
          expanded.delete(id);
        } else {
          expanded.add(id);
        }
        return { expandedFolderIds: expanded };
      },
      false,
      'toggleFolder'
    );
  },

  expandFolder: (id: string) => {
    set(
      (state) => {
        const expanded = new Set(state.expandedFolderIds);
        expanded.add(id);
        return { expandedFolderIds: expanded };
      },
      false,
      'expandFolder'
    );
  },

  collapseFolder: (id: string) => {
    set(
      (state) => {
        const expanded = new Set(state.expandedFolderIds);
        expanded.delete(id);
        return { expandedFolderIds: expanded };
      },
      false,
      'collapseFolder'
    );
  },

  clearDocuments: () => {
    set(
      {
        documents: [],
        selectedDocumentId: null,
        expandedFolderIds: new Set(),
        isFirstFetchFinished: false,
      },
      false,
      'clearDocuments'
    );
  },

  internal_updateDocuments: (documents: DocumentItem[]) => {
    set({ documents }, false, 'internal_updateDocuments');
  },

  internal_addDocument: (document: DocumentItem) => {
    set(
      (state) => ({
        documents: [document, ...state.documents],
      }),
      false,
      'internal_addDocument'
    );
  },

  internal_updateSingleDocument: (id: string, updates: Partial<DocumentItem>) => {
    set(
      (state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...updates } : doc
        ),
      }),
      false,
      'internal_updateSingleDocument'
    );
  },

  internal_removeDocument: (id: string) => {
    set(
      (state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }),
      false,
      'internal_removeDocument'
    );
  },
});
