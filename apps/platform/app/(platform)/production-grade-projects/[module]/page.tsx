import { notFound } from "next/navigation"
import { courseData } from "@/app/(platform)/production-grade-projects/lib/course-data"
import { ModulePageClient } from "@/app/(platform)/production-grade-projects/components/module-page-client"

export default function ModulePage({
  params,
  searchParams,
}: {
  params: { module: string }
  searchParams: { lesson?: string }
}) {
  const category = courseData.find(c => c.slug === "production-grade-projects")
  const module = category?.modules.find(
    m => m.slug === params.module
  )

  if (!category || !module) notFound()

  const activeLessonId =
    searchParams.lesson ??
    module.chapters[0]?.lessons[0]?.id

  return (
    <ModulePageClient
      category={category}
      module={module}
      activeLessonId={activeLessonId}
    />
  )
}
