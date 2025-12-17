"use client";

import React from 'react';
import { Button } from "@thinkthroo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@thinkthroo/ui/components/dropdown-menu";
import { Plus } from 'lucide-react';

export interface FileTreeActionsProps {
  onCreateFile: () => void;
  onCreateFolder: () => void;
  disabled?: boolean;
}

export function FileTreeActions({
  onCreateFile,
  onCreateFolder,
  disabled = false,
}: FileTreeActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Add new"
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onCreateFile}>
          New File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateFolder}>
          New Folder
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
