import { CategoryHeader } from "@/app/(platform)/architecture/components/category-header"
import { ModuleCard } from "@/app/(platform)/architecture/components/module-card"
import { courseData, type SanityModule } from "./lib/course-data"
import { sanityClient } from "@/lib/sanity-client"

const ARCHITECTURE_MODULES_QUERY = `
*[
  _type == "module" &&
  "Codebase Architecture" in categories[]->title
]{
  title,
  description,
  slug,
  tags[]->{
    title
  },
  "chapterCount": count(*[_type == "chapter" && references(^._id)]),
  "lessonCount": count(*[_type == "codebaseArchitecture" && ^._id in chapter[]->module[]._ref]),
  "chapter": *[
    _type == "chapter" &&
    references(^._id) &&
    order == 1
  ][0]{
    "chapterSlug": slug,
    "lesson": *[
      _type == "codebaseArchitecture" &&
      references(^._id) &&
      order == 1
    ][0]{
      "lessonSlug": slug.current
    }
  }
}
`

const category = courseData[0]

export default async function ArchitecturePage() {
  const architectureModules: SanityModule[] = await sanityClient.fetch(ARCHITECTURE_MODULES_QUERY)

  return (
    <div className="page">
      <CategoryHeader category={category} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {architectureModules.map((module) => (
                <ModuleCard key={module.slug} module={module} />
              ))}
            </div>
          </main>
    </div>
  )
}
