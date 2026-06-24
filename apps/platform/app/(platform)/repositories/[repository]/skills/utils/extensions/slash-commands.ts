import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

export const SlashCommand = Node.create({
  name: 'slashCommand',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('slashCommand'),
        state: {
          init() {
            return { active: false, range: null as { from: number; to: number; } | null, query: '' };
          },
          apply(tr: any) {
            const { selection } = tr;
            const { $from } = selection;
            const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

            const match = textBefore.match(/\/(\w*)$/);

            if (match) {
              return {
                active: true,
                range: {
                  from: $from.pos - match[0].length,
                  to: $from.pos,
                },
                query: match[1],
              };
            }

            return { active: false, range: null, query: '' };
          },
        },
      }),
    ];
  },
});
