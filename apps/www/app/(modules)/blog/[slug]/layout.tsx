import { DocsLayout } from "fumadocs-ui/layouts/docs"
import React, { ReactNode } from "react"
import { getBlogTree } from "@/lib/blog-tree"
import { BlogTocPromo } from "@/components/interfaces/blog/blogtocpromo"
import { ScrollPromoModal } from "@/components/interfaces/blog/scroll-promo-modal"

export default async function Layout({ children }: { children: ReactNode }) {
  const tree = await getBlogTree()

  return (
    <DocsLayout tree={tree}>
      <BlogTocPromo />
      {children}
       <ScrollPromoModal />
    </DocsLayout>
  )
}
