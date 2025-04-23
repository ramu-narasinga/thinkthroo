import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'chapter',
  title: 'Chapter',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'module',
      title: 'Module',
      type: 'array',
      of: [{type: 'reference', to: {type: 'module'}}],
    }),
  ],
})
