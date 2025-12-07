// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { bundledLanguages } from "shiki";
var docs = defineDocs({
  dir: "content/docs"
});
var source_config_default = defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "github-dark"
      },
      langs: Object.keys(bundledLanguages)
    }
  }
});
export {
  source_config_default as default,
  docs
};
