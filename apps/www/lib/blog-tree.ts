import { cache } from "react";
import { client } from "@/sanity/client";
import { ALL_POSTS_QUERY } from "@/sanity/lib/queries";
import { POST_QUERYResult } from "@/sanity/types";
import type * as PageTree from "fumadocs-core/page-tree";

/**
 * Cached function to build blog sidebar tree from Sanity posts
 * Uses React cache() to deduplicate requests within a single render
 */
export const getBlogTree = cache(async (): Promise<PageTree.Root> => {
  // Fetch all posts - cached at build time with no revalidation
  const docs = await client.fetch<POST_QUERYResult>(ALL_POSTS_QUERY);
  
  const root: PageTree.Root = {
    name: "Blog",
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
          url: `/blog/${page.slug}`,
        });
      }

      yearFolder.children.push(monthFolder);
    }

    root.children.push(yearFolder);
  }

  return root;
});
