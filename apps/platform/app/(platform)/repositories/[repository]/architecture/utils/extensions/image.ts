import { Node, mergeAttributes } from '@tiptap/core';

export const CustomImage = Node.create({
  name: 'customImage',
  group: 'block',
  draggable: true,
  
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      align: { default: 'center' },
      width: { default: 'auto' }
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-image]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-image': '', class: 'image-wrapper' }, 
      ['img', mergeAttributes(HTMLAttributes)]
    ];
  },
  
  addCommands() {
    return {
      setCustomImage:
        (options: Record<string, any>) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    } as Partial<import('@tiptap/core').RawCommands>;
  },
});
