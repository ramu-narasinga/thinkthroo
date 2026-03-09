"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SanityCourseSidebar } from "@/app/(platform)/architecture/components/sanity-course-sidebar"
import { SanityLessonContent } from "@/app/(platform)/architecture/components/sanity-lesson-content"
import type { SanityLesson, SanityChapter, SanityChapterLesson } from "@/lib/lesson"

interface SanityModulePageClientProps {
  moduleSlug: string
  moduleTitle: string
  chapters: SanityChapter[]
  initialLesson: SanityLesson
  initialChapter: SanityChapter
}

export function SanityModulePageClient({
  moduleSlug,
  moduleTitle,
  chapters,
  initialLesson,
  initialChapter,
}: SanityModulePageClientProps) {
  const router = useRouter()

  /** Flat ordered list: [{chapter, lesson}] */
  const allItems = useMemo(
    () =>
      chapters.flatMap((ch) =>
        ch.lessons.map((l) => ({ chapter: ch, lesson: l }))
      ),
    [chapters]
  )

  const [currentLesson, setCurrentLesson] = useState<SanityLesson>(initialLesson)
  const [currentChapter, setCurrentChapter] = useState<SanityChapter>(initialChapter)

  const currentIndex = allItems.findIndex(
    (item) => item.lesson.slug === currentLesson.slug
  )

  const handleSelectLesson = async (
    lessonRef: SanityChapterLesson,
    chapter: SanityChapter
  ) => {
    // Optimistically update the URL without a full navigation
    router.replace(
      `/architecture/${moduleSlug}/${chapter.title}/${lessonRef.slug}`,
      { scroll: false }
    )

    // Fetch the full lesson body client-side
    const res = await fetch(
      `/api/architecture/lesson?slug=${lessonRef.slug}`
    )
    if (res.ok) {
      const lesson: SanityLesson = await res.json()
      setCurrentLesson(lesson)
      setCurrentChapter(chapter)
    }
  }

  const navigate = (delta: number) => {
    const next = allItems[currentIndex + delta]
    if (next) handleSelectLesson(next.lesson, next.chapter)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <SanityCourseSidebar
        moduleTitle={moduleTitle}
        chapters={chapters}
        selectedLessonSlug={currentLesson.slug}
        onSelectLesson={handleSelectLesson}
      />
      <SanityLessonContent
        lesson={currentLesson}
        chapter={currentChapter}
        onPrevious={() => navigate(-1)}
        onNext={() => navigate(1)}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < allItems.length - 1}
      />
    </div>
  )
}
