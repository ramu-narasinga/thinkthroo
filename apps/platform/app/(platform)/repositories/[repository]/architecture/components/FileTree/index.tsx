"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/document';
import { useDocumentTree } from '../../hooks/useDocumentTree';
import { FileTreeItem } from './FileTreeItem';
import { FileTreeActions } from './FileTreeActions';
import { DocumentTreeNode } from '../../utils/documentTree';

export interface FileTreeProps {
  onCreateFile: (parentId?: string) => void;
  onCreateFolder: (parentId?: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function FileTree({
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  isLoading = false,
}: FileTreeProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tree, isFolderExpanded } = useDocumentTree();
  const toggleFolder = useDocumentStore((s) => s.toggleFolder);

  const selectedDocumentId = searchParams.get('doc');

  const handleSelectDocument = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('doc', id);
    router.push(`?${params.toString()}`);
  };

  const renderTree = (nodes: DocumentTreeNode[]) => {
    return nodes.map((node) => (
      <FileTreeItem
        key={node.id}
        node={node}
        isExpanded={isFolderExpanded(node.id)}
        isSelected={selectedDocumentId === node.id}
        selectedDocumentId={selectedDocumentId}
        isFolderExpanded={isFolderExpanded}
        onToggle={toggleFolder}
        onSelect={handleSelectDocument}
        onRename={onRename}
        onDelete={onDelete}
        onCreateFile={onCreateFile}
        onCreateFolder={onCreateFolder}
      />
    ));
  };

  return (
    <aside className="w-80 border-r h-full px-3 py-4 bg-white flex flex-col gap-3">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Architecture</h3>
        <FileTreeActions
          onCreateFile={() => onCreateFile()}
          onCreateFolder={() => onCreateFolder()}
          disabled={isLoading}
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="py-6 text-center text-sm text-slate-500">
            Loading…
          </div>
        ) : tree.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">
            No files yet — create one.
          </div>
        ) : (
          <ul role="tree" className="space-y-0.5" aria-label="Document tree">
            {renderTree(tree)}
          </ul>
        )}
      </div>
    </aside>
  );
}
