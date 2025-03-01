// contentlayer.config.js
import path from "path";
import { getHighlighter, loadTheme } from "@shikijs/compat";
import {
  defineDocumentType,
  defineNestedType,
  makeSource
} from "contentlayer2/source-files";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { codeImport } from "remark-code-import";
import remarkGfm from "remark-gfm";
import { visit as visit2 } from "unist-util-visit";

// lib/rehype-npm-command.ts
import { visit } from "unist-util-visit";

// contentlayer.config.js
var computedFields = {
  slug: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/")
  }
};
var LinksProperties = defineNestedType(() => ({
  name: "LinksProperties",
  fields: {
    doc: {
      type: "string"
    },
    api: {
      type: "string"
    }
  }
}));
var Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `*/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: false
    },
    description: {
      type: "string",
      required: false
    },
    published: {
      type: "boolean",
      default: false
    },
    links: {
      type: "nested",
      of: LinksProperties
    },
    featured: {
      type: "boolean",
      default: false,
      required: false
    },
    component: {
      type: "boolean",
      default: false,
      required: false
    },
    toc: {
      type: "boolean",
      default: true,
      required: false
    }
  },
  computedFields
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "./content",
  documentTypes: [Doc],
  mdx: {
    remarkPlugins: [remarkGfm, codeImport],
    rehypePlugins: [
      rehypeSlug,
      // rehypeComponent,
      () => (tree) => {
        visit2(tree, (node) => {
          if (node?.type === "element" && node?.tagName === "pre") {
            const [codeEl] = node.children;
            if (codeEl.tagName !== "code") {
              return;
            }
            if (codeEl.data?.meta) {
              const regex = /event="([^"]*)"/;
              const match = codeEl.data?.meta.match(regex);
              if (match) {
                node.__event__ = match ? match[1] : null;
                codeEl.data.meta = codeEl.data.meta.replace(regex, "");
              }
            }
            node.__rawString__ = codeEl.children?.[0].value;
            node.__src__ = node.properties?.__src__;
            node.__style__ = node.properties?.__style__;
          }
        });
      },
      [
        rehypePrettyCode,
        {
          getHighlighter: async () => {
            const theme = await loadTheme(
              path.join(process.cwd(), "/lib/highlighter-theme.json")
            );
            return await getHighlighter({ theme });
          },
          onVisitLine(node) {
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }];
            }
          },
          onVisitHighlightedLine(node) {
            node.properties.className.push("line--highlighted");
          },
          onVisitHighlightedWord(node) {
            node.properties.className = ["word--highlighted"];
          }
        }
      ]
      //   () => (tree) => {
      //     visit(tree, (node) => {
      //       if (node?.type === "element" && node?.tagName === "div") {
      //         if (!("data-rehype-pretty-code-fragment" in node.properties)) {
      //           return
      //         }
      //         const preElement = node.children.at(-1)
      //         if (preElement.tagName !== "pre") {
      //           return
      //         }
      //         preElement.properties["__withMeta__"] =
      //           node.children.at(0).tagName === "div"
      //         preElement.properties["__rawString__"] = node.__rawString__
      //         if (node.__src__) {
      //           preElement.properties["__src__"] = node.__src__
      //         }
      //         if (node.__event__) {
      //           preElement.properties["__event__"] = node.__event__
      //         }
      //         if (node.__style__) {
      //           preElement.properties["__style__"] = node.__style__
      //         }
      //       }
      //     })
      //   },
      //   rehypeNpmCommand,
      //   [
      //     rehypeAutolinkHeadings,
      //     {
      //       properties: {
      //         className: ["subheading-anchor"],
      //         ariaLabel: "Link to section",
      //       },
      //     },
      //   ],
    ]
  }
});
export {
  Doc,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-X2F2NMO2.mjs.map
