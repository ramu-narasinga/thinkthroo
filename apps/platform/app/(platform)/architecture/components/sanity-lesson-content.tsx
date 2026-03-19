"use client"

import React, { useState } from "react"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@thinkthroo/ui/components/button"
import { Separator } from "@thinkthroo/ui/components/separator"
import ReactMarkdownLib from "react-markdown"
const ReactMarkdown = ReactMarkdownLib as unknown as React.FC<{ children: string }>
import type { SanityLesson, SanityChapter } from "@/lib/lesson"

interface SanityLessonContentProps {
  lesson: SanityLesson
  chapter: SanityChapter
  isCompleted?: boolean
  onMarkComplete?: () => Promise<void>
  onMarkIncomplete?: () => Promise<void>
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious: boolean
  hasNext: boolean
}

export function SanityLessonContent({
  lesson,
  chapter,
  isCompleted = false,
  onMarkComplete,
  onMarkIncomplete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: SanityLessonContentProps) {
  const [loading, setLoading] = useState(false)

  const handleToggleComplete = async () => {
    setLoading(true)
    try {
      if (isCompleted) {
        await onMarkIncomplete?.()
      } else {
        await onMarkComplete?.()
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
      <div className="max-w-4xl mx-auto p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span>{chapter.title}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{lesson.title}</span>
        </div>

        {/* Title & description */}
        <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-4">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="text-base text-muted-foreground mb-8">{lesson.description}</p>
        )}

        {/* Body */}
        <div className="prose prose-neutral dark:prose-invert max-w-none pb-12 pt-2">
          {lesson.body ? (
            <ReactMarkdown>{lesson.body as string}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground">No content available for this lesson.</p>
          )}
        </div>

        <Separator className="my-8" />

        {/* Prev / Mark Complete / Next */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {(onMarkComplete || onMarkIncomplete) && (
            <Button
              onClick={handleToggleComplete}
              disabled={loading}
              variant={isCompleted ? "secondary" : "default"}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {isCompleted ? "Completed" : "Mark as Complete"}
            </Button>
          )}

          <Button variant="outline" onClick={onNext} disabled={!hasNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
