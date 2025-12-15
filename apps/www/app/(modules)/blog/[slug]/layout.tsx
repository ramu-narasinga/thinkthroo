import { DocsLayout } from "fumadocs-ui/layouts/docs";
import React, { ReactNode } from "react";
import { getBlogTree } from "@/lib/blog-tree";

export default async function Layout({ children }: { children: ReactNode }) {
  // Fetch cached blog tree - uses React cache() to deduplicate within render
  const tree = await getBlogTree();

  return (
    <DocsLayout tree={tree}>
      {children}
    </DocsLayout>
  );
}
