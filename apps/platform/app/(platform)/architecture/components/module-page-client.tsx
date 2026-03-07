"use client"

import { useState, useMemo } from "react"
import { CourseSidebar } from "@/app/(platform)/architecture/components/course-sidebar"
import { LessonContent } from "@/app/(platform)/architecture/components/lesson-content"
import type { Category, Module, Lesson, Chapter } from "@/app/(platform)/architecture/lib/course-data"

interface ModulePageClientProps {
  category: Category
  module: Module
  activeLessonId?: string
}

export function ModulePageClient({
  category,
  module,
  activeLessonId,
}: ModulePageClientProps) {
  const allLessons = useMemo(() => {
    return module.chapters.flatMap((ch) =>
      ch.lessons.map((l) => ({ lesson: l, chapter: ch }))
    )
  }, [module])

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (activeLessonId) {
      const index = allLessons.findIndex(
        (item) => item.lesson.id === activeLessonId
      )
      if (index >= 0) return index
    }

    const firstIncomplete = allLessons.findIndex(
      (item) => !item.lesson.completed
    )
    return firstIncomplete >= 0 ? firstIncomplete : 0
  })

  const currentItem = allLessons[currentIndex]

  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    currentItem.lesson
  )
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(
    currentItem.chapter
  )

  const handleSelectLesson = (lesson: Lesson, chapter: Chapter) => {
    setSelectedLesson(lesson)
    setSelectedChapter(chapter)
    const index = allLessons.findIndex(
      (item) => item.lesson.id === lesson.id
    )
    if (index >= 0) setCurrentIndex(index)
  }

  const handleMarkComplete = (lessonId: string) => {
    console.log("Marking lesson complete:", lessonId)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prev = allLessons[currentIndex - 1]
      setSelectedLesson(prev.lesson)
      setSelectedChapter(prev.chapter)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      const next = allLessons[currentIndex + 1]
      setSelectedLesson(next.lesson)
      setSelectedChapter(next.chapter)
      setCurrentIndex(currentIndex + 1)
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <CourseSidebar
        module={module}
        selectedLessonId={selectedLesson.id}
        onSelectLesson={handleSelectLesson}
      />

      <LessonContent
        lesson={selectedLesson}
        chapter={selectedChapter}
        onMarkComplete={handleMarkComplete}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < allLessons.length - 1}
      />
    </div>
  )
}
