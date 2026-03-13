"use client";

import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "@thinkthroo/editor";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";
import { useDocumentStore } from '@/store/document';
import { documentByIdSelector } from '@/store/document/selectors';
import type { UpdateDocumentInput } from '@/store/document/slices/document/action';

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

import hljs from "highlight.js";
import posthog from "posthog-js";
import { Button } from "@thinkthroo/ui/components/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@thinkthroo/ui/components/tooltip";
import { useFileStore } from "@/store/file";
import { fileManagerSelectors } from "@/store/file/slices/fileManager/selectors";

const extensions = [...defaultExtensions, slashCommand];

export interface EditorPanelProps {
  documentId: string;
}

const SAVE_DEBOUNCE_TIME = 2000; // 2 seconds

export default function EditorPanel({ documentId }: EditorPanelProps) {
  // Get document from store
  const document = useDocumentStore(documentByIdSelector(documentId));
  const fetchDocumentById = useDocumentStore((s) => s.fetchDocumentById);
  const internal_updateSingleDocument = useDocumentStore((s) => s.internal_updateSingleDocument);
  const updateDocument = useDocumentStore((s) => s.updateDocument);
  const publishFile = useFileStore((s) => s.publishFile);
  const fetchChunkCount = useFileStore((s) => s.fetchChunkCount);
  const isChunking = useFileStore(fileManagerSelectors.isCreatingFileParseTask(documentId));
  const chunkCount = useFileStore(fileManagerSelectors.chunkCountSelector(documentId));

  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'Saving…' | 'Saved'>('Saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [charsCount, setCharsCount] = useState();
  const [isPublishing, setIsPublishing] = useState(false);

  // Tracks whether a content edit has reverted a published doc back to draft
  const revertToDraftRef = useRef(false);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  
  const defaultEditorContent: JSONContent = useMemo(
    () => ({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [
            {
              type: "text",
              text: "Untitled Document",
            },
          ],
        },
        {
          type: "paragraph",
        },
      ],
    }),
    []
  );

  // Fetch document when documentId changes (if not already in store with content)
  useEffect(() => {
    const loadDocument = async () => {
      setIsLoading(true);
      try {
        // Check if document exists in store with content
        if (!document?.editorData && !document?.content) {
          // Fetch from API if not cached
          await fetchDocumentById(documentId);
        }
      } catch (error) {
        console.error('[EditorPanel] Error loading document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId, document?.editorData, document?.content, fetchDocumentById]);

  // Calculate initial content from document
  const initialContent: JSONContent = useMemo(() => {
    if (!document) return defaultEditorContent;
    
    if (document.editorData) {
      return document.editorData as JSONContent;
    }
    
    if (document.content) {
      return {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: document.content }] }],
      };
    }
    
    return defaultEditorContent;
  }, [document, defaultEditorContent]);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = useCallback((content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el as HTMLElement);
    });
    return new XMLSerializer().serializeToString(doc);
  }, []);

  const debouncedUpdates = useDebouncedCallback(async (editor: EditorInstance) => {
    if (!document) return;
    
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    const htmlContent = highlightCodeblocks(editor.getHTML());
    
    // Update store immediately (optimistic update)
    internal_updateSingleDocument(document.id, {
      content: htmlContent,
      editorData: json,
    });
    
    // Then save to API
    try {
      const updatePayload: UpdateDocumentInput = {
        content: htmlContent,
        editorData: json,
      };
      // If content was edited while status was 'published', persist the revert to draft
      if (revertToDraftRef.current) {
        updatePayload.status = 'draft';
        revertToDraftRef.current = false;
      }
      await useDocumentStore.getState().updateDocument(document.id, updatePayload);
      setLastSavedAt(new Date());
      setSaveStatus('Saved');

      // PostHog: Track document saved
      posthog.capture('document_saved', {
        document_id: document.id,
        document_name: document.name,
        word_count: editor.storage.characterCount.words(),
      });
    } catch (error) {
      console.error('[EditorPanel] Error saving document:', error);
      posthog.captureException(error as Error);
    }
  }, SAVE_DEBOUNCE_TIME);

  // Reset UI state when document changes
  useEffect(() => {
    setSaveStatus('Saved');
    setLastSavedAt(null);
    setCharsCount(undefined);
  }, [document?.id]);

  // Load existing chunk count when a published document is opened
  useEffect(() => {
    if (document?.status === 'published') {
      fetchChunkCount(documentId);
    }
  }, [documentId, document?.status, fetchChunkCount]);

  if (isLoading || !document) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Loading document...
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-screen-lg">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2 items-center">
        {/* Save status with last-saved tooltip */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground cursor-default select-none">
                {saveStatus}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {lastSavedAt
                ? `Last saved at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Not saved yet'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Draft / Published badge — driven by document.status in the DB */}
        {document.status === 'draft' ? (
          <div className="rounded-lg bg-yellow-100 text-yellow-700 px-2 py-1 text-sm font-medium select-none">
            Draft
          </div>
        ) : (
          <div className="rounded-lg bg-green-100 text-green-700 px-2 py-1 text-sm font-medium select-none">
            Published
          </div>
        )}

        {/* Chunking status badge */}
        {isChunking && (
          <div className="rounded-lg bg-purple-100 text-purple-700 px-2 py-1 text-sm font-medium select-none animate-pulse">
            Chunking…
          </div>
        )}

        {/* Chunk count badge — shown once indexing completes */}
        {!isChunking && chunkCount > 0 && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 rounded-lg bg-purple-100 text-purple-700 px-2 py-1 text-sm font-medium select-none cursor-default">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {chunkCount}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {chunkCount} chunk{chunkCount !== 1 ? 's' : ''} indexed
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>

        {/* Only show Publish when document is still in draft */}
        {document.status === 'draft' && (
          <Button
            size="sm"
            disabled={isPublishing}
            onClick={async () => {
              setIsPublishing(true);
              try {
                await updateDocument(documentId, { status: 'published' });
                publishFile(documentId);
              } finally {
                setIsPublishing(false);
              }
            }}
            className="h-7 text-xs cursor-pointer disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing…' : 'Publish'}
          </Button>
        )}
      </div>
      <EditorRoot key={document.id}>
        <EditorContent
          immediatelyRender={false}
          initialContent={initialContent}
          extensions={extensions}
          className="relative w-full h-full max-w-screen-lg bg-background sm:mb-[calc(20vh)] sm:rounded-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
            setSaveStatus('Saving…');
            // If document was published, revert it to draft on content change
            if (document.status === 'published') {
              internal_updateSingleDocument(document.id, { status: 'draft' });
              revertToDraftRef.current = true;
            }
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}
