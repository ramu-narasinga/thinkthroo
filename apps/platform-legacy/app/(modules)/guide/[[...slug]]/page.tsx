import { notFound } from "next/navigation"
import "@/styles/mdx.css"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons"
import Balancer from "react-wrap-balancer"
import { siteConfig } from "@/config/site"
import { getTableOfContents } from "@/lib/toc"
import { absoluteUrl, cn } from "@/lib/utils"
// import { Mdx } from "@/components/interfaces/guide/mdx-components"
import MDX from "@thinkthroo/lesson/markdown/mdx"
import { DocsPager } from "@/components/interfaces/guide/pager"
import { DashboardTableOfContents } from "@/components/interfaces/guide/toc"
import { badgeVariants } from "@thinkthroo/ui/components/components/badge"
import { ScrollArea } from "@thinkthroo/ui/components/components/scroll-area"
import { createClient } from "@/utils/supabase/server"
import RequestSignin from "@/components/interfaces/guide/request-signin"
import { fetchChaptersByModuleSlug, fetchLessonBySlug } from "@/lib/lesson"
import { components } from "@/components/interfaces/guide/mdx-components"
import { CATEGORY_SLUG_INDEX, categoryToGroqLabel, LESSON_SLUG_INDEX, MODULE_SLUG_INDEX } from "@/utils/constants"
import { DocsSidebarNav } from "@/components/interfaces/guide/side-nav"
import RequestUpgrade from "@/components/interfaces/guide/request-upgrade"
interface DocPageProps {
  params: {
    slug: string[]
  }
}

// async function getDocFromParams({ params }: DocPageProps) {

//   const slug = params.slug?.join("/") || ""
//   const doc = allDocs.find((doc) => doc.slugAsParams === slug)

//   if (!doc) {
//     return null
//   }

//   return doc
// }

// export async function generateMetadata({
//   params,
// }: DocPageProps): Promise<Metadata> {
//   const doc = await getDocFromParams({ params })

//   if (!doc) {
//     return {}
//   }

//   return {
//     title: doc.title,
//     description: doc.description,
//     openGraph: {
//       title: doc.title,
//       description: doc.description,
//       type: "article",
//       url: absoluteUrl(doc.slug),
//       images: [
//         {
//           url: siteConfig.ogImage,
//           width: 1200,
//           height: 630,
//           alt: siteConfig.name,
//         },
//       ],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: doc.title,
//       description: doc.description,
//       images: [siteConfig.ogImage],
//       creator: "@thinkthroo",
//     },
//   }
// }

// export async function generateStaticParams(): Promise<
//   DocPageProps["params"][]
// > {
//   return allDocs.map((doc) => ({
//     slug: doc.slugAsParams.split("/"),
//   }))
// }

export default async function DocPage({ params }: DocPageProps) {

  let category = params.slug[CATEGORY_SLUG_INDEX]

  const lesson = await fetchLessonBySlug(params.slug[LESSON_SLUG_INDEX], categoryToGroqLabel[category]);

  const chapters = await fetchChaptersByModuleSlug(params.slug[MODULE_SLUG_INDEX], categoryToGroqLabel[category])

  // if (!doc) {
  //   notFound()
  // }

  const toc = await getTableOfContents(lesson.body)

  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  let hasAccess = false

  if (user) {
    const { data } = await supabase
      .from("subscriptions")
      .select("expires_at")
      .eq("customer_id", user.id)
      .single()

    if (data?.expires_at) {
      hasAccess = new Date(data.expires_at).getTime() > Date.now()
    }
  }

  return (
    <>
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
        <ScrollArea className="h-full py-6 pr-6 lg:py-8">
          <DocsSidebarNav chapters={chapters} />
        </ScrollArea>
      </aside>
      <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
        <div className="mx-auto w-full min-w-0">
          <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground">
            <div className="truncate">Guide</div>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <div className="text-foreground">{lesson.title}</div>
          </div>
          <div className="space-y-2">
            <h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight")}>
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-base text-muted-foreground">
                <Balancer>{lesson.description}</Balancer>
              </p>
            )}
          </div>
          <div className="pb-12 pt-8">
            {
              !user?.id ? (
                <div className="w-full mx-auto flex justify-center">
                  <RequestSignin />
                </div>
              ) : 
              (
                !hasAccess && 
                process.env.NO_PAY_WALL?.split(",").indexOf(category) == -1
              ) ? (
              <div className="w-full mx-auto flex justify-center">
                <RequestUpgrade />
              </div>
            ) : (
              <MDX source={lesson.body} components={components} />
            )}
          </div>
          {/* <DocsPager doc={doc} pathname={params.slug?.join("/")} /> */}
          {/* <DocsPager doc={{
              // sidebarNav: [] 
            }} pathname={params.slug?.join("/")} /> */}
        </div>
        {/* {lesson.toc && ( */}
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