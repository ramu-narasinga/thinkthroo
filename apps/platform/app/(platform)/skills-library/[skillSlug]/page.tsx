import { notFound } from "next/navigation"
import { fetchSkillBySlug, buildInstallCommand } from "@/lib/skill"
import { serverDB } from "@/database/core/db-adaptor"
import { SkillStatsModel } from "@/database/models/skillStats"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Separator } from "@thinkthroo/ui/components/separator"
import { Tag } from "lucide-react"
import ReactMarkdown from "react-markdown"

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ skillSlug: string }>
}) {
  const { skillSlug } = await params

  // Fetch skill content from Sanity
  const skill = await fetchSkillBySlug(skillSlug)
  if (!skill) notFound()

  // Fetch stats from Supabase
  const statsModel = new SkillStatsModel(serverDB)
  const stats = await statsModel.getBySlug(skillSlug)

  const installCommand = buildInstallCommand(skill.repoUrl, skill.slug)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">

        {/* Title */}
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
          {skill.title}
        </h1>
        {skill.description && (
          <p className="text-base text-muted-foreground mb-6">{skill.description}</p>
        )}

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {skill.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-xs">
                <Tag className="h-3 w-3" />
                {tag.title}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="my-6" />

        {/* Install command */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Install
          </h2>
          <div className="flex items-center gap-3 bg-muted rounded-md px-4 py-3 font-mono text-sm">
            <span className="text-muted-foreground select-none">$</span>
            <span className="text-foreground break-all">{installCommand}</span>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Stats table */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Stats
          </h2>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium text-muted-foreground w-1/3">
                    Weekly Downloads
                  </td>
                  <td className="px-4 py-3">
                    {(stats?.weeklyDownloads ?? 0).toLocaleString()}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-medium text-muted-foreground">
                    Created At
                  </td>
                  <td className="px-4 py-3">{formatDate(stats?.createdAt ?? null)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-muted-foreground">
                    Updated At
                  </td>
                  <td className="px-4 py-3">{formatDate(stats?.updatedAt ?? null)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Skill content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none pt-2 pb-12">
          {skill.body ? (
            <ReactMarkdown>{skill.body}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">No content available for this skill yet.</p>
          )}
        </div>

      </div>
    </div>
  )
}
