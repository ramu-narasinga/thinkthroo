import { fetchAllSkills } from "@/lib/skill"
import { CategoryHeader } from "@/app/(platform)/skills-library/components/category-header"
import { SkillsGrid } from "@/app/(platform)/skills-library/components/skills-grid"

export default async function SkillsLibraryPage() {
  // Fetch skills content from Sanity
  const skills = await fetchAllSkills()

  return (
    <div className="page">
      <CategoryHeader
        totalSkills={skills.length}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <SkillsGrid skills={skills} />
      </main>
    </div>
  )
}
