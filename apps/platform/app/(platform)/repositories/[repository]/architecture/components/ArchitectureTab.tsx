"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentMutations } from '../hooks/useDocumentMutations';
import { FileTree } from './FileTree';
import EditorPanel from './EditorPanel';
import {
  CreateDocumentModal,
  RenameDocumentModal,
  DeleteDocumentModal,
} from './modals';
import { documentClientService } from '@/service/document';

interface ModalState {
  create: {
    open: boolean;
    parentId?: string | null;
    type?: 'file' | 'folder';
  };
  rename: {
    open: boolean;
    documentId?: string;
  };
  delete: {
    open: boolean;
    documentId?: string;
  };
}

export default function ArchitectureTab() {
  const { repository: repositoryNameParam } = useParams();
  const searchParams = useSearchParams();
  
  const repositoryName = Array.isArray(repositoryNameParam)
    ? repositoryNameParam[0]
    : repositoryNameParam;

  if (!repositoryName || typeof repositoryName !== 'string' || !repositoryName.trim()) {
    throw new Error('ArchitectureTab requires a valid repository name');
  }

  // Get selected document ID from query params
  const selectedDocumentId = searchParams.get('doc');

  // State for repository ID lookup
  const [repositoryId, setRepositoryId] = useState<string | null>(null);
  const [isLoadingRepo, setIsLoadingRepo] = useState(true);
  const [repoError, setRepoError] = useState<string | null>(null);

  // Modal state
  const [modals, setModals] = useState<ModalState>({
    create: { open: false },
    rename: { open: false },
    delete: { open: false },
  });

  // Look up repository ID from name
  useEffect(() => {
    const fetchRepositoryId = async () => {
      try {
        setIsLoadingRepo(true);
        const repo = await documentClientService.getRepositoryIdByName(repositoryName);
        setRepositoryId(repo.id);
        setRepoError(null);
      } catch (error) {
        console.error('[ArchitectureTab] Error fetching repository:', error);
        setRepoError(error instanceof Error ? error.message : 'Failed to load repository');
      } finally {
        setIsLoadingRepo(false);
      }
    };

    fetchRepositoryId();
  }, [repositoryName]);

  // Hooks
  const { documents, isLoading } = useDocuments(repositoryId || '');
  const { createDocument, updateDocument, deleteDocument } = useDocumentMutations();

  // Create handlers
  const handleOpenCreate = useCallback((type: 'file' | 'folder', parentId?: string) => {
    setModals((prev) => ({
      ...prev,
      create: { open: true, type, parentId: parentId || null },
    }));
  }, []);

  const handleCreate = useCallback(
    async (name: string) => {
      if (!repositoryId) return;
      await createDocument({
        repositoryId,
        parentId: modals.create.parentId || null,
        name,
        type: modals.create.type || 'file',
        content: modals.create.type === 'file' ? '' : undefined,
      });
    },
    [createDocument, repositoryId, modals.create]
  );

  // Rename handlers
  const handleOpenRename = useCallback((documentId: string) => {
    setModals((prev) => ({
      ...prev,
      rename: { open: true, documentId },
    }));
  }, []);

  const handleRename = useCallback(
    async (newName: string) => {
      if (!modals.rename.documentId) return;
      await updateDocument(modals.rename.documentId, { name: newName });
    },
    [updateDocument, modals.rename.documentId]
  );

  // Delete handlers
  const handleOpenDelete = useCallback((documentId: string) => {
    setModals((prev) => ({
      ...prev,
      delete: { open: true, documentId },
    }));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!modals.delete.documentId) return;
    await deleteDocument(modals.delete.documentId);
  }, [deleteDocument, modals.delete.documentId]);

  // Get document for rename/delete modals
  const renameDocument = modals.rename.documentId
    ? documents.find((d) => d.id === modals.rename.documentId)
    : null;

  const deleteDocumentData = modals.delete.documentId
    ? documents.find((d) => d.id === modals.delete.documentId)
    : null;

  // Show loading or error states
  if (isLoadingRepo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Loading repository...</p>
      </div>
    );
  }

  if (repoError || !repositoryId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{repoError || 'Repository not found'}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full bg-white border rounded shadow-sm overflow-hidden">
      {/* File Tree Sidebar */}
      <FileTree
        onCreateFile={(parentId) => handleOpenCreate('file', parentId)}
        onCreateFolder={(parentId) => handleOpenCreate('folder', parentId)}
        onRename={handleOpenRename}
        onDelete={handleOpenDelete}
        isLoading={isLoading}
      />

      {/* Editor Panel */}
      {selectedDocumentId ? (
        <EditorPanel documentId={selectedDocumentId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          Select a file to edit
        </div>
      )}

      {/* Modals */}
      <CreateDocumentModal
        open={modals.create.open}
        type={modals.create.type || 'file'}
        onClose={() => setModals((prev) => ({ ...prev, create: { open: false } }))}
        onCreate={handleCreate}
      />

      {renameDocument && (
        <RenameDocumentModal
          open={modals.rename.open}
          currentName={renameDocument.name}
          onClose={() => setModals((prev) => ({ ...prev, rename: { open: false } }))}
          onRename={handleRename}
        />
      )}

      {deleteDocumentData && (
        <DeleteDocumentModal
          open={modals.delete.open}
          documentName={deleteDocumentData.name}
          documentType={deleteDocumentData.type}
          onClose={() => setModals((prev) => ({ ...prev, delete: { open: false } }))}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
