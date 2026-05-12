import { notFound } from "next/navigation"
import { fetchSkillBySlug, fetchSkillItemsByModuleSlug, buildInstallCommand } from "@/lib/skill"
import { fetchSkillChaptersByModuleSlug } from "@/lib/lesson"
import { SkillPageClient } from "@/app/(platform)/skills-library/components/skill-page-client"

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ skillSlug: string }>
}) {
  const { skillSlug } = await params

  // Fetch module (skill group) from Sanity
  const skill = await fetchSkillBySlug(skillSlug)
  if (!skill) notFound()

  // Fetch individual skill items and chapters in parallel
  const [skillItems, chapters] = await Promise.all([
    fetchSkillItemsByModuleSlug(skillSlug),
    fetchSkillChaptersByModuleSlug(skillSlug),
  ])

  const installCommand = buildInstallCommand(skill.repoUrl, skill.slug)

  return (
    <SkillPageClient
      skill={skill}
      skillItems={skillItems}
      chapters={chapters}
      installCommand={installCommand}
    />
  )
}
