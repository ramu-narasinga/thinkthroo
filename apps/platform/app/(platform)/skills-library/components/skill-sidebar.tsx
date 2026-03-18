"use client"

import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"
import type { SanitySkillItem } from "@/lib/skill"

interface SkillSidebarProps {
  moduleTitle: string
  skills: SanitySkillItem[]
  selectedSkillSlug?: string
  onSelectSkill: (skill: SanitySkillItem) => void
}

export function SkillSidebar({
  moduleTitle,
  skills,
  selectedSkillSlug,
  onSelectSkill,
}: SkillSidebarProps) {
  return (
    <div className="w-80 border-r border-border bg-background overflow-y-auto shrink-0">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">{moduleTitle}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {skills.length} {skills.length === 1 ? "skill" : "skills"}
        </p>
      </div>

      <div className="py-2">
        {skills.map((skill) => {
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
        })}

        {skills.length === 0 && (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            No skills added yet.
          </p>
        )}
      </div>
    </div>
  )
}
