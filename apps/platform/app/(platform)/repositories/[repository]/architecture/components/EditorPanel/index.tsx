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
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";
import { useDocumentStore } from '@/store/document';
import { documentByIdSelector } from '@/store/document/selectors';

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import hljs from "highlight.js";

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
  
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  
  const defaultEditorContent: JSONContent = useMemo(
    () => ({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Start writing your document here...",
            },
          ],
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
      await useDocumentStore.getState().updateDocument(document.id, {
        content: htmlContent,
        editorData: json,
      });
      setSaveStatus("Saved");
    } catch (error) {
      console.error('[EditorPanel] Error saving document:', error);
      setSaveStatus("Error");
    }
  }, SAVE_DEBOUNCE_TIME);

  // Reset UI state when document changes
  useEffect(() => {
    setSaveStatus("Saved");
    setCharsCount(undefined);
  }, [document?.id]);

  if (isLoading || !document) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        Loading document...
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-screen-lg">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus}</div>
        <div className={charsCount ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
          {charsCount} Words
        </div>
      </div>
      <EditorRoot key={document.id}>
        <EditorContent
          immediatelyRender={false}
          initialContent={initialContent}
          extensions={extensions}
          className="relative w-full h-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border"
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
            setSaveStatus("Unsaved");
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
            <MathSelector />
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
