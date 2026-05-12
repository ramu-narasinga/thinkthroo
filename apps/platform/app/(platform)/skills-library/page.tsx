import { fetchAllSkills } from "@/lib/skill"
import { getServerDB } from "@/database/core/db-adaptor"
import { SkillStatsModel } from "@/database/models/skillStats"
import { CategoryHeader } from "@/app/(platform)/skills-library/components/category-header"
import { SkillsGrid } from "@/app/(platform)/skills-library/components/skills-grid"

export default async function SkillsLibraryPage() {
  // Fetch skills content from Sanity
  const skills = await fetchAllSkills()

  // Fetch stats from Supabase for all skills
  let allStats: Awaited<ReturnType<SkillStatsModel["getAll"]>> = []
  try {
    const db = await getServerDB()
    const statsModel = new SkillStatsModel(db)
    allStats = await statsModel.getAll()
  } catch (err) {
    console.error("[SkillsLibraryPage] Failed to fetch skill stats:", err)
  }
  const statsMap = Object.fromEntries(allStats.map((s) => [s.skillSlug, s]))

  const totalWeeklyDownloads = allStats.reduce(
    (sum, s) => sum + (s.weeklyDownloads ?? 0),
    0
  )

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
