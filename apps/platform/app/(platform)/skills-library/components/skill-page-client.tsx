"use client"

import { useState, useCallback } from "react"
import { SkillSidebar } from "@/app/(platform)/skills-library/components/skill-sidebar"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Separator } from "@thinkthroo/ui/components/separator"
import { Tag } from "lucide-react"
import ReactMarkdown from "react-markdown"
import type { SanitySkill, SanitySkillItem, SanitySkillTag } from "@/lib/skill"
import type { SanityChapter } from "@/lib/lesson"

interface SkillStatsProps {
  weeklyDownloads: number
  createdAt: string | null
  updatedAt: string | null
}

interface SkillPageClientProps {
  skill: SanitySkill
  skillItems: SanitySkillItem[]
  chapters: SanityChapter[]
  installCommand: string
  stats: SkillStatsProps
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function SkillPageClient({
  skill,
  skillItems,
  chapters,
  installCommand,
  stats,
}: SkillPageClientProps) {
  const [selectedSkill, setSelectedSkill] = useState<SanitySkillItem | null>(
    skillItems[0] ?? null
  )
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  const handleSelectSkill = useCallback(async (item: SanitySkillItem) => {
    // If body already present (passed from server), use it directly
    if (item.body !== undefined) {
      setSelectedSkill(item)
      return
    }
    // Otherwise fetch from API
    setLoadingSlug(item.slug)
    try {
      const res = await fetch(`/api/skills-library/skill?slug=${item.slug}`)
      if (res.ok) {
        const fetched: SanitySkillItem = await res.json()
        setSelectedSkill(fetched)
      }
    } finally {
      setLoadingSlug(null)
    }
  }, [])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <SkillSidebar
        moduleTitle={skill.title}
        skills={skillItems}
        chapters={chapters}
        selectedSkillSlug={selectedSkill?.slug}
        onSelectSkill={handleSelectSkill}
      />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">

          {/* Module title + description */}
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            {skill.title}
          </h1>
          {skill.description && (
            <p className="text-base text-muted-foreground mb-6">{skill.description}</p>
          )}

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {skill.tags.map((tag: SanitySkillTag, idx: number) => (
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
                      {stats.weeklyDownloads.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      Created At
                    </td>
                    <td className="px-4 py-3">{formatDate(stats.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      Updated At
                    </td>
                    <td className="px-4 py-3">{formatDate(stats.updatedAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Selected skill body */}
          {selectedSkill ? (
            <>
              <h2 className="text-xl font-semibold mb-4">{selectedSkill.title}</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none pt-2 pb-12">
                {loadingSlug === selectedSkill.slug ? (
                  <p className="text-muted-foreground">Loading…</p>
                ) : selectedSkill.body ? (
                  <ReactMarkdown>{selectedSkill.body}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">No content available for this skill yet.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground pb-12">
              Select a skill from the sidebar to view its content.
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
