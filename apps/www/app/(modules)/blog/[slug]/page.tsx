import { notFound } from "next/navigation"

import "@/styles/mdx.css"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons"
import Balancer from "react-wrap-balancer"

import { siteConfig } from "@/config/site"
import { getTableOfContents } from "@/lib/toc"
import { absoluteUrl, cn } from "@/lib/utils"
import { components } from "@/components/interfaces/course/mdx-components"
import { DocsPager } from "@/components/interfaces/course/pager"
import { DashboardTableOfContents } from "@/components/interfaces/course/toc"
import { badgeVariants } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchGroupedPostsForSidebar, fetchPostBySlug, urlFor } from "@/lib/articles"
import serializeMDX from "@thinkthroo/lesson/markdown/serialize-mdx"
import ConvertKitForm from "@/components/interfaces/site/forms/newsletter"
import MDX from "@thinkthroo/lesson/markdown/mdx"
import { DocsSidebarNav } from "@/components/interfaces/course/side-nav"
import { client } from "@/sanity/client";

interface DocPageProps {
  params: {
    slug: string
  }
}

const POST_QUERY = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    description,
    slug,
    body,
    categories,
    links
  }
`

async function getDocFromParams({ params }: DocPageProps) {
  const slug = params.slug || ""
  const doc = await client.fetch(POST_QUERY, { slug })

  return doc || null
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const doc = await getDocFromParams({ params })

  if (!doc) {
    return {}
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: absoluteUrl(doc.slug),
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [siteConfig.ogImage],
      creator: "@thinkthroo",
    },
  }
}

export async function generateStaticParams(): Promise<DocPageProps["params"][]> {
  const slugs = await client.fetch(`
    *[_type == "post" && defined(slug.current)][]{
      "slug": slug.current
    }
  `)

  return slugs.map((doc: { slug: string }) => ({
    slug: doc.slug
  }))
}

export default async function DocPage({ params }: DocPageProps) {

  const post = await fetchPostBySlug(params.slug);

  const doc = await getDocFromParams({ params })

  const postImageUrl = post.image
    ? urlFor(post.image)?.width(550).height(310).url()
    : null;

  const articleBodySerialized =
    typeof post.body === 'string' &&
    (await serializeMDX(post.body, 
      // {
      //   useShikiTwoslash: true,
      //   syntaxHighlighterOptions: {
      //     theme: 'dark-plus',
      //     // showCopyButton: true,
      //   },
      // }
  ))

  if (!doc) {
    notFound()
  }

  const toc = await getTableOfContents(post.body)
  const groupedPosts = await fetchGroupedPostsForSidebar()

  return (
    <>
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
        <ScrollArea className="h-full py-6 pr-6 lg:py-8">
          <DocsSidebarNav
            // config={docsConfig}
            config={{ sidebarNav: groupedPosts }}
          />
        </ScrollArea>
      </aside>
      <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
        <div className="mx-auto w-full min-w-0">
          <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground">
            <div className="truncate">Blog</div>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <div className="text-foreground">{doc.title}</div>
          </div>
          <div className="space-y-2">
            <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-base text-muted-foreground">
                <Balancer>{doc.description}</Balancer>
              </p>
            )}
          </div>
          {doc.links ? (
            <div className="flex items-center space-x-2 pt-4">
              {doc.links?.doc && (
                <Link
                  href={doc.links.doc}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}
                >
                  Docs
                  <ExternalLinkIcon className="h-3 w-3" />
                </Link>
              )}
              {doc.links?.api && (
                <Link
                  href={doc.links.api}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}
                >
                  API Reference
                  <ExternalLinkIcon className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : null}
          <div className="pb-12 pt-8">
            {/* <Mdx code={doc.body.code} /> */}
            <MDX
              // contents={articleBodySerialized}
              // components={components}
              source={post.body}  // Pass the raw MDX content here
              components={components}
            />
            <ConvertKitForm />
          </div>
          <DocsPager doc={{ 
            slug: params.slug,
            sidebarNav: groupedPosts 
          }} />
        </div>
        {/* {doc.toc && ( */}
          <div className="hidden text-sm xl:block">
            <div className="sticky top-16 -mt-10 pt-4">
              <ScrollArea className="pb-10">
                <div className="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] py-12">
                  <DashboardTableOfContents toc={toc} />
                </div>
              </ScrollArea>
            </div>
          </div>
        {/* )} */}
      </main>
    </>
  )
}