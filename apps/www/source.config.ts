import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { bundledLanguages } from 'shiki';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      langs: Object.keys(bundledLanguages),
    },
  },
});