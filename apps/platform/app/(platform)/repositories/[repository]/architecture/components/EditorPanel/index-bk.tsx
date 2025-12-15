"use client";

import React, { useCallback } from 'react';
import { 
  EditorRoot, 
  EditorContent, 
  StarterKit, 
  type JSONContent,
  type EditorInstance,
} from '@thinkthroo/editor';
import { useDebounceFn } from 'ahooks';
import { DocumentItem } from '@/database/schemas';

const SAVE_DEBOUNCE_TIME = 2000; // 2 seconds

export interface EditorPanelProps {
  document: DocumentItem;
  onSave: (id: string, content: string) => Promise<void>;
}

const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
  }),
];

export function EditorPanel({ document, onSave }: EditorPanelProps) {
  const handleContentChange = useCallback(
    (content: string) => {
      console.log('[EditorPanel] Content changed, scheduling save');
      onSave(document.id, content);
    },
    [document.id, onSave]
  );

  const { run: debouncedSave } = useDebounceFn(handleContentChange, {
    wait: SAVE_DEBOUNCE_TIME,
  });

  // Parse initial content (handle both string and JSON)
  const initialContent: JSONContent | undefined = document.content
    ? typeof document.content === 'string'
      ? { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: document.content }] }] }
      : (document.editorData as JSONContent)
    : undefined;

  return (
    <main className="flex-1 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Document title */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-foreground">
            {document.name}
          </h2>
        </div>

        {/* Editor */}
        <EditorRoot>
          <EditorContent
            initialContent={initialContent}
            extensions={extensions}
            editorProps={{
              attributes: {
                class:
                  'prose prose-lg dark:prose-invert focus:outline-none max-w-full',
              },
            }}
            onUpdate={({ editor }: { editor: EditorInstance }) => {
              const html = editor.getHTML();
              debouncedSave(html);
            }}
            className="min-h-[500px]"
          />
        </EditorRoot>
      </div>
    </main>
  );
}
