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

  const category = courseData.find(c => c.slug === "architecture")
  const archModule = category?.modules.find(
    m => m.slug === moduleSlug
  )

  if (!category || !archModule) notFound()

  const activeLessonId =
    lesson ??
    archModule.chapters[0]?.lessons[0]?.id

  return (
    <ModulePageClient
      category={category}
      module={archModule}
      activeLessonId={activeLessonId}
    />
  )
}
