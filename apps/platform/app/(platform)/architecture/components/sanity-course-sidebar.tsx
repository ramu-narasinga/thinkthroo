"use client"

import * as React from "react"
import { ChevronRight, FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type SanityChapter, type SanityChapterLesson } from "@/lib/lesson"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@thinkthroo/ui/components/collapsible"

interface SanityCourseSidebarProps {
  moduleTitle: string
  chapters: SanityChapter[]
  selectedLessonSlug?: string
  completedLessonSlugs?: Set<string>
  onSelectLesson: (lesson: SanityChapterLesson, chapter: SanityChapter) => void
}

export function SanityCourseSidebar({
  moduleTitle,
  chapters,
  selectedLessonSlug,
  completedLessonSlugs = new Set(),
  onSelectLesson,
}: SanityCourseSidebarProps) {
  const [openChapters, setOpenChapters] = React.useState<number[]>(
    chapters.length > 0 ? [chapters[0].order] : []
  )

  const toggleChapter = (order: number) => {
    setOpenChapters((prev) =>
      prev.includes(order) ? prev.filter((o) => o !== order) : [...prev, order]
    )
  }

  return (
    <div className="w-80 border-r border-border bg-background overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">{moduleTitle}</h3>
      </div>

      <div className="py-2">
        {chapters.map((chapter) => {
          const isOpen = openChapters.includes(chapter.order)

          return (
            <Collapsible
              key={chapter.order}
              open={isOpen}
              onOpenChange={() => toggleChapter(chapter.order)}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent text-left">
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chapter.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {chapter.lessons.length} {chapter.lessons.length === 1 ? "lesson" : "lessons"}
                    </p>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-6 border-l border-border">
                  {chapter.lessons.map((lesson) => {
                    const isSelected = selectedLessonSlug === lesson.slug
                    const isCompleted = completedLessonSlugs.has(lesson.slug)

                    return (
                      <button
                        key={lesson.slug}
                        onClick={() => onSelectLesson(lesson, chapter)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors",
                          isSelected && "bg-accent"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <p className={cn("text-sm truncate", isCompleted && "text-muted-foreground line-through")}>
                          {lesson.title}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}
