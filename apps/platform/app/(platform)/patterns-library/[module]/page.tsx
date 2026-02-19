import { notFound } from "next/navigation"
import { courseData } from "@/app/(platform)/architecture/lib/course-data"
import { ModulePageClient } from "@/app/(platform)/architecture/components/module-page-client"

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>
  searchParams: Promise<{ lesson?: string }>
}) {
  const { module: moduleSlug } = await params
  const { lesson } = await searchParams

  const category = courseData.find(c => c.slug === "patterns-library")
  const plModule = category?.modules.find(
    m => m.slug === moduleSlug
  )

  if (!category || !plModule) notFound()

  const activeLessonId =
    lesson ??
    plModule.chapters[0]?.lessons[0]?.id

  return (
    <ModulePageClient
      category={category}
      module={plModule}
      activeLessonId={activeLessonId}
    />
  )
}
