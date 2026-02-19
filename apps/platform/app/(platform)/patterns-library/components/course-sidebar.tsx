"use client"

import * as React from "react"
import { ChevronRight, FileText, PlayCircle, HelpCircle, Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Module, Chapter, Lesson } from "@/app/(platform)/patterns-library/lib/course-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@thinkthroo/ui/components/collapsible"
import { Button } from "@thinkthroo/ui/components/button"

interface CourseSidebarProps {
  module: Module
  selectedLessonId?: string
  onSelectLesson: (lesson: Lesson, chapter: Chapter) => void
}

const lessonTypeIcons = {
  video: PlayCircle,
  article: FileText,
  quiz: HelpCircle,
}

export function CourseSidebar({ module, selectedLessonId, onSelectLesson }: CourseSidebarProps) {
  const [openChapters, setOpenChapters] = React.useState<string[]>([module.chapters[0]?.id || ""])

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]))
  }

  return (
    <div className="w-80 border-r border-border bg-background overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm">{module.title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="py-2">
        {module.chapters.map((chapter) => {
          const completedCount = chapter.lessons.filter((l) => l.completed).length
          const isOpen = openChapters.includes(chapter.id)

          return (
            <Collapsible key={chapter.id} open={isOpen} onOpenChange={() => toggleChapter(chapter.id)}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent text-left">
                  <ChevronRight
                    className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-90")}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chapter.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {completedCount}/{chapter.lessons.length} completed
                    </p>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-6 border-l border-border">
                  {chapter.lessons.map((lesson) => {
                    const Icon = lessonTypeIcons[lesson.type]
                    const isSelected = selectedLessonId === lesson.id

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson, chapter)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors",
                          isSelected && "bg-accent",
                        )}
                      >
                        {lesson.completed ? (
                          <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-primary-foreground" />
                          </div>
                        ) : (
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm truncate", lesson.completed && "text-muted-foreground")}>
                            {lesson.title}
                          </p>
                        </div>
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
