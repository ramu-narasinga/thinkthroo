import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

/**
 * Extension that ensures the first block in the document is always a heading.
 * If user tries to change it to something else, it converts it back to a heading.
 */
export const FirstHeading = Extension.create({
  name: 'firstHeading',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('firstHeading'),
        appendTransaction: (transactions, oldState, newState) => {
          // Check if document structure changed
          const docChanged = transactions.some(tr => tr.docChanged);
          if (!docChanged) return null;

          const { doc } = newState;
          const firstNode = doc.firstChild;

          // If first node exists and is NOT a heading, convert it
          if (firstNode && firstNode.type.name !== 'heading') {
            const tr = newState.tr;
            
            // Convert first node to heading level 1
            tr.setNodeMarkup(0, newState.schema.nodes.heading, {
              level: 1,
            });

            return tr;
          }

          return null;
        },
      }),
    ];
  },
});
