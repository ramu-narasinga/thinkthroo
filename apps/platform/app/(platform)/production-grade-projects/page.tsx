import { CategoryHeader } from "@/app/(platform)/production-grade-projects/components/category-header"
import { ModuleCard } from "@/app/(platform)/production-grade-projects/components/module-card"
import { courseData } from "./lib/course-data"

const category = courseData[0]
const categorySlug = category.slug

export default function ProductionGradeProjectsPage() {
  return (
    <div className="page">
      <CategoryHeader category={category} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.modules.map((module) => (
                <ModuleCard key={module.id} module={module} categorySlug={categorySlug} />
              ))}
            </div>
          </main>
    </div>
  )
}
