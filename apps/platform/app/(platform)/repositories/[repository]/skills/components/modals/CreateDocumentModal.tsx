"use client";

import React, { useState } from 'react';
import { Button } from "@thinkthroo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@thinkthroo/ui/components/dialog";
import { Input } from "@thinkthroo/ui/components/input";
import { Label } from "@thinkthroo/ui/components/label";

export interface CreateDocumentModalProps {
  open: boolean;
  type: 'file' | 'folder';
  defaultName?: string;
  onClose: () => void;
  onCreate: (name: string, description?: string) => Promise<void>;
}

export function CreateDocumentModal({
  open,
  type,
  defaultName = '',
  onClose,
  onCreate,
}: CreateDocumentModalProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFile = type === 'file';

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate(name.trim(), isFile ? description.trim() : undefined);
      setName('');
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isFile ? 'Create manually' : 'New Folder'}
          </DialogTitle>
          {isFile && (
            <p className="text-sm text-muted-foreground">
              Write a new SKILL.md from scratch.
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Name</Label>
            <Input
              id="document-name"
              placeholder={isFile ? 'e.g. review-helper' : 'My Folder'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              autoFocus
            />
            {isFile && (
              <p className="text-xs text-muted-foreground">
                Must be unique within the workspace.
              </p>
            )}
          </div>

          {isFile && (
            <div className="space-y-2">
              <Label htmlFor="document-description">Description</Label>
              <textarea
                id="document-description"
                rows={3}
                placeholder="One sentence on when to assign this skill to an agent."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? 'Creating...' : isFile ? 'Create skill' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
