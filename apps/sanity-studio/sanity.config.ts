import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {markdownSchema} from 'sanity-plugin-markdown'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Think Throo',

  projectId: '13jolr5q',
  dataset: 'production',

  plugins: [
    structureTool(), 
    visionTool(),
    markdownSchema()
  ],

  schema: {
    types: schemaTypes,
  },
})
