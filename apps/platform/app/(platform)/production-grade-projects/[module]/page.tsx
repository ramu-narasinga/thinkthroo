import { notFound } from "next/navigation"
import { courseData } from "@/app/(platform)/production-grade-projects/lib/course-data"
import { ModulePageClient } from "@/app/(platform)/production-grade-projects/components/module-page-client"

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>
  searchParams: Promise<{ lesson?: string }>
}) {
  const { module: moduleSlug } = await params
  const { lesson } = await searchParams

  const category = courseData.find(c => c.slug === "production-grade-projects")
  const pgpModule = category?.modules.find(
    m => m.slug === moduleSlug
  )

  if (!category || !pgpModule) notFound()

  const activeLessonId =
    lesson ??
    pgpModule.chapters[0]?.lessons[0]?.id

  return (
    <ModulePageClient
      category={category}
      module={pgpModule}
      activeLessonId={activeLessonId}
    />
  )
}
