import { notFound } from "next/navigation"
import { fetchPGPChaptersByModuleSlug, fetchPGPLessonBySlug } from "@/lib/lesson"
import { SanityModulePageClient } from "@/app/(platform)/production-grade-projects/components/sanity-module-page-client"

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>
}) {
  const { module: moduleSlug } = await params

  if (!moduleSlug) notFound()

  // Fetch sidebar data
  const chapters = await fetchPGPChaptersByModuleSlug(moduleSlug)
  if (!chapters || chapters.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No chapters available yet for this module.</p>
      </div>
    )
  }

  // Resolve which lesson to show (first lesson of the first chapter)
  const targetSlug = chapters[0]?.lessons[0]?.slug

  if (!targetSlug) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No lessons available yet for this module.</p>
      </div>
    )
  }

  const lesson = await fetchPGPLessonBySlug(targetSlug)
  if (!lesson) notFound()

  const initialChapter = chapters[0]

  const moduleTitle = moduleSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return (
    <SanityModulePageClient
      moduleSlug={moduleSlug}
      moduleTitle={moduleTitle}
      chapters={chapters}
      initialLesson={lesson}
      initialChapter={initialChapter}
    />
  )
}
