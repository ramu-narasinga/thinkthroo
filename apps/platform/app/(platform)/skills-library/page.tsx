import { fetchAllSkills } from "@/lib/skill"
import { serverDB } from "@/database/core/db-adaptor"
import { SkillStatsModel } from "@/database/models/skillStats"
import { CategoryHeader } from "@/app/(platform)/skills-library/components/category-header"
import { ModuleCard } from "@/app/(platform)/skills-library/components/module-card"

export default async function SkillsLibraryPage() {
  // Fetch skills content from Sanity
  const skills = await fetchAllSkills()

  // Fetch stats from Supabase for all skills
  const statsModel = new SkillStatsModel(serverDB)
  const allStats = await statsModel.getAll()
  const statsMap = Object.fromEntries(allStats.map((s) => [s.skillSlug, s]))

  const totalWeeklyDownloads = allStats.reduce(
    (sum, s) => sum + (s.weeklyDownloads ?? 0),
    0
  )

  return (
    <div className="page">
      <CategoryHeader
        totalSkills={skills.length}
        totalWeeklyDownloads={totalWeeklyDownloads}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <ModuleCard
              key={skill.slug}
              skill={skill}
              weeklyDownloads={statsMap[skill.slug]?.weeklyDownloads ?? 0}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
