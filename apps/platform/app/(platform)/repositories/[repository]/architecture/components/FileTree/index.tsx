"use client";

import React from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/document';
import { useDocumentTree } from '../../hooks/useDocumentTree';
import { FileTreeItem } from './FileTreeItem';
import { FileTreeActions } from './FileTreeActions';
import { DocumentTreeNode } from '../../utils/documentTree';
import { useOrganizationStore } from '@/store/organization';
import { organizationSelectors } from '@/store/organization/selectors';
import { PLAN_DOC_STORAGE_MB } from '@/const/pricing';

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
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
  const planName = useOrganizationStore(organizationSelectors.currentPlanName);
  const docStorageUsedMB = activeOrg?.docStorageUsedMB ?? 0;
  const docStorageMaxMB = PLAN_DOC_STORAGE_MB[planName] ?? PLAN_DOC_STORAGE_MB['free']!;
  const storagePercent = Math.min(100, (docStorageUsedMB / docStorageMaxMB) * 100);

  const formatMB = (mb: number) =>
    mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;

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

  if (!sidebarOpen) {
    return (
      <aside className="w-10 border-r h-full flex flex-col items-center pt-3 bg-white shrink-0" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Open sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-r px-3 py-4 bg-white flex flex-col gap-3 shrink-0" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Architecture</h3>
        <div className="flex items-center gap-1">
          <FileTreeActions
            onCreateFile={() => onCreateFile()}
            onCreateFolder={() => onCreateFolder()}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
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

      {/* Storage usage badge */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Doc storage</span>
          <span>{formatMB(docStorageUsedMB)} / {formatMB(docStorageMaxMB)}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${storagePercent >= 90 ? 'bg-red-500' : storagePercent >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
