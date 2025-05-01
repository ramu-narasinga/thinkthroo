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
import { badgeVariants } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/utils/supabase/server"
import RequestSignin from "@/components/interfaces/guide/request-signin"
import { fetchChaptersByModuleSlug, fetchLessonBySlug } from "@/lib/lesson"
import { components } from "@/components/interfaces/guide/mdx-components"
import { CATEGORY_SLUG_INDEX, categoryToGroqLabel, catergoryToGroqLabel, LESSON_SLUG_INDEX, MODULE_SLUG_INDEX } from "@/utils/constants"
import { DocsSidebarNav } from "@/components/interfaces/guide/side-nav"
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

  const chapters = await fetchChaptersByModuleSlug(params.slug[MODULE_SLUG_INDEX])

  console.log("lesson", lesson)

  // if (!doc) {
  //   notFound()
  // }

  const toc = await getTableOfContents(lesson.body)

  function allowPublicRoutes() {
    let noAuthRoutes = process.env.NEXT_PUBLIC_NO_AUTH_ROUTES?.split(",") ?? [];
    let matchedRoute = noAuthRoutes.filter((noAuthRoute: string) => params.slug?.join("/").includes(noAuthRoute))
    return matchedRoute.length > 0;
  }

  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

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
              (
                user?.id || 
                allowPublicRoutes()
              ) ? 
              // <Mdx code={doc.body.code} />
              <MDX
                source={lesson.body}
                components={components}
              /> :
              <div className="text-center w-full mx-auto">
                <RequestSignin />
              </div>
            }
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