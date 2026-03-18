import { notFound } from "next/navigation"
import { fetchPGPChaptersByModuleSlug, fetchPGPLessonBySlug } from "@/lib/lesson"
import { SanityModulePageClient } from "@/app/(platform)/production-grade-projects/components/sanity-module-page-client"

// URL shape: /production-grade-projects/[moduleSlug]/[chapterSlug]/[lessonSlug]
//   segments[0] = moduleSlug  (required)
//   segments[1] = chapterSlug (optional – used for display only)
//   segments[2] = lessonSlug  (optional)

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string[] }>
}) {
  const { module: segments } = await params
  const moduleSlug = segments[0]
  const lessonSlug = segments.length > 1 ? segments[segments.length - 1] : undefined

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

  // Resolve which lesson to show
  const targetSlug = lessonSlug ?? chapters[0]?.lessons[0]?.slug

  if (!targetSlug) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">No lessons available yet for this module.</p>
      </div>
    )
  }

  const lesson = await fetchPGPLessonBySlug(targetSlug)
  if (!lesson) notFound()

  // Find the chapter that owns this lesson for the initial state
  const initialChapter =
    chapters.find((ch) => ch.lessons.some((l) => l.slug === targetSlug)) ??
    chapters[0]

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
