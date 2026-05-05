"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { FileText, ChevronDown, ChevronRight } from "lucide-react"
import type { SanitySkillItem } from "@/lib/skill"
import type { SanityChapter } from "@/lib/lesson"

interface SkillSidebarProps {
  moduleTitle: string
  skills: SanitySkillItem[]
  chapters?: SanityChapter[]
  selectedSkillSlug?: string
  onSelectSkill: (skill: SanitySkillItem) => void
}

export function SkillSidebar({
  moduleTitle,
  skills,
  chapters,
  selectedSkillSlug,
  onSelectSkill,
}: SkillSidebarProps) {
  const hasChapters = chapters && chapters.length > 0

  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>(
    () => Object.fromEntries((chapters ?? []).map((_, i) => [i, true]))
  )

  const toggleChapter = (idx: number) =>
    setOpenChapters((prev) => ({ ...prev, [idx]: !prev[idx] }))

  const handleLessonClick = (lesson: { title: string; slug: string }) => {
    onSelectSkill({ title: lesson.title, slug: lesson.slug, publishedAt: null })
  }

  return (
    <div className="w-80 border-r border-border bg-background overflow-y-auto shrink-0">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">{moduleTitle}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {hasChapters
            ? `${chapters.length} ${chapters.length === 1 ? "chapter" : "chapters"}`
            : `${skills.length} ${skills.length === 1 ? "skill" : "skills"}`}
        </p>
      </div>

      <div className="py-2">
        {hasChapters ? (
          chapters.map((chapter, idx) => (
            <div key={idx}>
              <button
                onClick={() => toggleChapter(idx)}
                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-accent transition-colors"
              >
                {openChapters[idx] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-medium truncate">{chapter.title}</span>
              </button>
              {openChapters[idx] && (
                <div>
                  {chapter.lessons.map((lesson) => {
                    const isSelected = selectedSkillSlug === lesson.slug
                    return (
                      <button
                        key={lesson.slug}
                        onClick={() => handleLessonClick(lesson)}
                        className={cn(
                          "w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-left hover:bg-accent transition-colors",
                          isSelected && "bg-accent"
                        )}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-sm truncate">{lesson.title}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          skills.map((skill) => {
            const isSelected = selectedSkillSlug === skill.slug
            return (
              <button
                key={skill.slug}
                onClick={() => onSelectSkill(skill)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent transition-colors",
                  isSelected && "bg-accent"
                )}
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm truncate">{skill.title}</p>
              </button>
            )
          })
        )}

        {!hasChapters && skills.length === 0 && (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            No skills added yet.
          </p>
        )}
      </div>
    </div>
  )
}
