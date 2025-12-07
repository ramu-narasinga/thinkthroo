import { DocsLayout } from "fumadocs-ui/layouts/docs";
import React, { ReactNode } from "react";
import { POST_QUERYResult } from "@/sanity/types";
import { sanityFetch } from "@/sanity/lib/live";
import { ALL_POSTS_QUERY } from "@/sanity/lib/queries";
import type * as PageTree from "fumadocs-core/page-tree";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
      <Content>{children}</Content>
  );
}

async function Content({ children }: { children: ReactNode }) {
  const docs = (await sanityFetch({ query: ALL_POSTS_QUERY }))
    .data as POST_QUERYResult;
  const root: PageTree.Root = {
    name: "Docs",
    children: [],
  };

  // Group posts by year and month
  const groupedByDate: Record<string, Record<string, typeof docs>> = {};
  
  for (const page of docs) {
    if (!page.publishedAt) continue;
    
    const date = new Date(page.publishedAt);
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    
    if (!groupedByDate[year]) {
      groupedByDate[year] = {};
    }
    if (!groupedByDate[year][month]) {
      groupedByDate[year][month] = [];
    }
    groupedByDate[year][month].push(page);
  }

  // Sort years in descending order (newest first)
  const sortedYears = Object.keys(groupedByDate).sort((a, b) => parseInt(b) - parseInt(a));
  
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  for (const year of sortedYears) {
    const yearFolder: PageTree.Folder = {
      type: "folder",
      name: year,
      index: undefined,
      children: [],
    };

    // Sort months in descending order (newest first)
    const months = Object.keys(groupedByDate[year]).sort(
      (a, b) => monthOrder.indexOf(b) - monthOrder.indexOf(a)
    );

    for (const month of months) {
      const monthFolder: PageTree.Folder = {
        type: "folder",
        name: month,
        index: undefined,
        children: [],
      };

      for (const page of groupedByDate[year][month]) {
        monthFolder.children.push({
          type: "page",
          name: page.title ?? "",
          url: `/sanity-docs/${page.slug}`,
        });
      }

      yearFolder.children.push(monthFolder);
    }

    root.children.push(yearFolder);
  }

  return (
    <DocsLayout tree={root}>
      {children}
    </DocsLayout>
  );
}
