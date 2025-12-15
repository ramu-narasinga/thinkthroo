'use client';

import './TipTapEditor.css'
import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Editor } from '@tiptap/react';

import { Badge } from "@thinkthroo/ui/components/badge";
import { Button } from "@thinkthroo/ui/components/button";
import { Database } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@thinkthroo/ui/components/tooltip"
import { CustomImage } from '../utils/extensions/image'
import { SlashCommand } from '../utils/extensions/slash-commands'

interface TiptapEditorProps {
  title: string;
  content?: string;
  onChange?: (content: string) => void;
  publishFile: (id: string) => Promise<void>;
}

interface SlashMenuItem {
  title: string;
  icon: string;
  command: (editor: Editor) => void;
}

interface SlashMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  range: {
    from: number;
    to: number;
  };
  editor: Editor;
}

const SlashMenu = ({ items, command }: SlashMenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        command(items[selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, items, command]);

  return (
    <div className="slash-menu">
      <div className="slash-menu-header">Basic Blocks</div>
      {items.map((item, index) => (
        <button
          key={item.title}
          className={`slash-menu-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => command(item)}
        >
          <span className="slash-menu-icon">{item.icon}</span>
          <span className="slash-menu-title">{item.title}</span>
        </button>
      ))}
    </div>
  );
};

const TiptapEditor = ({ title, content, onChange, publishFile }: TiptapEditorProps) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashMenuPosition, setSlashMenuPosition] = useState({
    top: 0,
    left: 0,
    from: 0,
    to: 0
  });

  const slashCommands: SlashMenuItem[] = [
    {
      title: 'Paragraph',
      icon: '¶',
      command: (editor:Editor) => {
        if (typeof slashMenuPosition.from === 'number' && typeof slashMenuPosition.to === 'number') {
          editor.chain().focus().deleteRange({ from: slashMenuPosition.from, to: slashMenuPosition.to }).setParagraph().run();
        }
        setShowSlashMenu(false);
      }
    },
    {
      title: 'Heading 1',
      icon: 'H₁',
      command: (editor:Editor) => {
        if (typeof slashMenuPosition.from === 'number' && typeof slashMenuPosition.to === 'number') {
          editor.chain().focus().deleteRange({ from: slashMenuPosition.from, to: slashMenuPosition.to }).setHeading({ level: 1 }).run();
        }
        setShowSlashMenu(false);
      }
    },
    {
      title: 'Heading 2',
      icon: 'H₂',
      command: (editor:Editor) => {
        if (typeof slashMenuPosition.from === 'number' && typeof slashMenuPosition.to === 'number') {
          editor.chain().focus().deleteRange({ from: slashMenuPosition.from, to: slashMenuPosition.to }).setHeading({ level: 2 }).run();
        }
        setShowSlashMenu(false);
      }
    },
    {
      title: 'Heading 3',
      icon: 'H₃',
      command: (editor:Editor) => {
        if (typeof slashMenuPosition.from === 'number' && typeof slashMenuPosition.to === 'number') {
          editor.chain().focus().deleteRange({ from: slashMenuPosition.from, to: slashMenuPosition.to }).setHeading({ level: 3 }).run();
        }
        setShowSlashMenu(false);
      }
    },
    {
      title: 'Code Block',
      icon: '</>',
      command: (editor:Editor) => {
        if (typeof slashMenuPosition.from === 'number' && typeof slashMenuPosition.to === 'number') {
          editor.chain().focus().deleteRange({ from: slashMenuPosition.from, to: slashMenuPosition.to }).setCodeBlock().run();
        }
        setShowSlashMenu(false);
      }
    },
    {
      title: 'Image',
      icon: '🖼',
      command: (editor:Editor) => {
        const url = window.prompt('Enter image URL:');
        if (
          url &&
          typeof slashMenuPosition.from === 'number' &&
          typeof slashMenuPosition.to === 'number'
        ) {
          editor.chain().focus().deleteRange({ from: slashMenuPosition.from, to: slashMenuPosition.to })?.setCustomImage({ src: url, align: 'center' }).run();
        }
        setShowSlashMenu(false);
      }
    }
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      SlashCommand,
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none px-16 py-8',
      },
      handleKeyDown: (view, event) => {
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

        if (event.key === '/') {
          setTimeout(() => {
            const coords = view.coordsAtPos(selection.from);
            setSlashMenuPosition({
              top: coords.bottom,
              left: coords.left,
              from: selection.from,
              to: selection.from + 1
            });
            setShowSlashMenu(true);
          }, 10);
        } else if (showSlashMenu && event.key === 'Escape') {
          setShowSlashMenu(false);
        }

        const match = textBefore.match(/\/(\w*)$/);
        if (match && showSlashMenu) {
          setSlashQuery(match[1]);
          setSlashMenuPosition(prev => ({
            ...prev,
            from: selection.from - match[0].length,
            to: selection.from
          }));
        } else if (!match && showSlashMenu) {
          setShowSlashMenu(false);
        }
      },
    },
    immediatelyRender: false
  });


  editor?.on('update', () => {
    const html = editor.getHTML();
    onChange?.(html);
  });

  useEffect(() => {
    if (editor && content) {
      editor.on("create", () => {
        editor.commands.setContent(content);
      });
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  const filteredCommands = slashCommands.filter(cmd =>
    cmd.title.toLowerCase().includes(slashQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
     

      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm min-h-[calc(100vh-120px)] relative">
        {/* Page Header */}
        <div className="border-b border-gray-200 px-16 py-8">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full text-2xl">
              😊
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
              {/* <p className="text-gray-500 text-sm">Page description (optional)</p> */}
              <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer">
                    <Database className="h-3 w-3" />
                    <span>{0}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>All current text chunks have been embedded.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            </div>
            {/* <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical size={20} className="text-gray-600" />
            </button> */}
            <Button 
              variant="default"
              onClick={async () => {
                await publishFile('md1');
              }}
            >Publish</Button>
            <Button variant="default">Index</Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="editor-wrapper group">
          <EditorContent editor={editor} />
        </div>

        {/* Slash Command Menu */}
        {showSlashMenu && (
          <div
            className="slash-menu-container"
            style={{
              position: 'fixed',
              top: `${slashMenuPosition.top}px`,
              left: `${slashMenuPosition.left}px`,
            }}
          >
            <SlashMenu
              items={filteredCommands}
              command={(item:any) => item.command(editor)}
              range={slashMenuPosition}
              editor={editor}
            />
          </div>
        )}

        {/* Footer */}
        {/* <div className="absolute bottom-8 left-16 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
          </div>
          <span className="text-sm text-gray-500">Last modified now</span>
        </div> */}
      </div>
    </div>
  );
};

export default TiptapEditor;
