import { CategoryHeader } from "@/app/(platform)/production-grade-projects/components/category-header"
import { ModuleCard } from "@/app/(platform)/production-grade-projects/components/module-card"
import { courseData } from "@/app/(platform)/production-grade-projects/lib/course-data"
import { type SanityModule } from "@/app/(platform)/architecture/lib/course-data"
import { sanityClient } from "@/lib/sanity-client"

const PGP_MODULES_QUERY = `
*[
  _type == "module" &&
  "Production Grade Projects" in categories[]->title
]{
  title,
  description,
  slug,
  tags[]->{
    title
  },
  "chapterCount": count(*[_type == "chapter" && references(^._id)]),
  "lessonCount": count(*[_type == "productionGradeProjects" && ^._id in chapter[]->module[]._ref]),
  "chapter": *[
    _type == "chapter" &&
    references(^._id) &&
    order == 1
  ][0]{
    "chapterSlug": slug,
    "lesson": *[
      _type == "productionGradeProjects" &&
      references(^._id) &&
      order == 1
    ][0]{
      "lessonSlug": slug.current
    }
  }
}
`

const category = courseData.find((c) => c.slug === "production-grade-projects") ?? courseData[0]

export default async function ProductionGradeProjectsPage() {
  const pgpModules: SanityModule[] = await sanityClient.fetch(PGP_MODULES_QUERY)

  const totalLessons = pgpModules.reduce(
    (sum, m) => sum + (m.lessonCount ?? 0),
    0
  )

  return (
    <div className="page">
      <CategoryHeader
        category={category}
        totalLessons={totalLessons}
        totalModules={pgpModules.length}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pgpModules.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </main>
    </div>
  )
}
