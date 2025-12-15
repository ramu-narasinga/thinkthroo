"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@thinkthroo/ui/components/alert-dialog";

export interface DeleteDocumentModalProps {
  open: boolean;
  documentName: string;
  documentType: 'file' | 'folder';
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export function DeleteDocumentModal({
  open,
  documentName,
  documentType,
  onClose,
  onDelete,
}: DeleteDocumentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {documentType === 'file' ? 'File' : 'Folder'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{documentName}</strong>?
            {documentType === 'folder' && (
              <span className="block mt-2 text-red-600">
                This will also delete all files and subfolders inside it.
              </span>
            )}
            <span className="block mt-2">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
