"use client";

import React from 'react';
import { Button } from "@thinkthroo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@thinkthroo/ui/components/dropdown-menu";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpenDot,
  File,
  MoreHorizontal,
} from 'lucide-react';
import { DocumentTreeNode } from '../../utils/documentTree';

export interface FileTreeItemProps {
  node: DocumentTreeNode;
  level?: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateFile: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
}

export function FileTreeItem({
  node,
  level = 0,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
}: FileTreeItemProps) {
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && node.children && node.children.length > 0;

  const handleClick = () => {
    if (isFolder) {
      onToggle(node.id);
    } else {
      onSelect(node.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick();
    } else if (e.key === 'Delete') {
      onDelete(node.id);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      onRename(node.id);
    }
  };

  return (
    <li
      role="treeitem"
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-selected={isSelected}
    >
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`group flex items-center gap-2 w-full px-1.5 py-0.5 rounded-sm hover:bg-muted/60 focus:outline-none focus:ring-1 focus:ring-ring ${
          isSelected ? 'bg-muted/60' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Chevron for folders */}
          {isFolder ? (
            <button
              aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              className="p-0.5 rounded hover:bg-muted"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div style={{ width: 16 }} />
          )}

          {/* Icon */}
          {isFolder ? (
            isExpanded ? (
              <FolderOpenDot className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}

          {/* Name */}
          <button
            onClick={handleClick}
            className="truncate text-left font-mono text-sm text-foreground"
            style={{ maxWidth: '14rem' }}
          >
            {node.name}
          </button>
        </div>

        {/* Actions Menu */}
        <div className="ml-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More actions"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onRename(node.id)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(node.id)}>
                Delete
              </DropdownMenuItem>
              {isFolder && (
                <>
                  <DropdownMenuItem onClick={() => onCreateFile(node.id)}>
                    Add File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateFolder(node.id)}>
                    Add Folder
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Render children if expanded */}
      {isFolder && isExpanded && hasChildren && (
        <div className="pl-4 ml-2 w-full border-l border-border">
          <ul role="group" className="space-y-0.5">
            {node.children!.map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                level={level + 1}
                isExpanded={isExpanded}
                isSelected={isSelected}
                onToggle={onToggle}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
