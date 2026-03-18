"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SanityCourseSidebar } from "@/app/(platform)/architecture/components/sanity-course-sidebar"
import { SanityLessonContent } from "@/app/(platform)/architecture/components/sanity-lesson-content"
import type { SanityLesson, SanityChapter, SanityChapterLesson } from "@/lib/lesson"
import { courseProgressClient } from "@/service/courseProgress/client"

const COURSE_SLUG = "architecture"

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
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set())

  const currentIndex = allItems.findIndex(
    (item) => item.lesson.slug === currentLesson.slug
  )

  // On mount: enroll / resume and load completed lessons
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        courseProgressClient.enrollOrResume({
          courseSlug: COURSE_SLUG,
          moduleSlug,
          lastChapterSlug: initialChapter.title,
          lastLessonSlug: initialLesson.slug,
        }),
        courseProgressClient
          .getCompletedLessons({ courseSlug: COURSE_SLUG, moduleSlug })
          .then((rows) =>
            setCompletedSlugs(new Set(rows.map((r) => r.lessonSlug)))
          ),
      ])
    }
    init().catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleSlug])

  const handleSelectLesson = useCallback(async (
    lessonRef: SanityChapterLesson,
    chapter: SanityChapter
  ) => {
    // Optimistically update the URL without a full navigation
    const chapterSegment = chapter.title.replace(/\//g, "-")
    router.replace(
      `/architecture/${moduleSlug}/${chapterSegment}/${lessonRef.slug}`,
      { scroll: false }
    )

    // Persist resume position
    courseProgressClient.updateLastLesson({
      courseSlug: COURSE_SLUG,
      moduleSlug,
      chapterSlug: chapter.title,
      lessonSlug: lessonRef.slug,
    }).catch(console.error)

    // Fetch the full lesson body client-side
    const res = await fetch(
      `/api/architecture/lesson?slug=${lessonRef.slug}`
    )
    if (res.ok) {
      const lesson: SanityLesson = await res.json()
      setCurrentLesson(lesson)
      setCurrentChapter(chapter)
    }
  }, [moduleSlug, router])

  const handleMarkComplete = useCallback(async (lessonSlug: string) => {
    const chapterForLesson =
      chapters.find((ch) => ch.lessons.some((l) => l.slug === lessonSlug))
        ?.title ?? currentChapter.title

    await courseProgressClient.markLessonComplete({
      courseSlug: COURSE_SLUG,
      moduleSlug,
      chapterSlug: chapterForLesson,
      lessonSlug,
    })

    setCompletedSlugs((prev) => new Set([...prev, lessonSlug]))
  }, [chapters, currentChapter.title, moduleSlug])

  const handleMarkIncomplete = useCallback(async (lessonSlug: string) => {
    await courseProgressClient.markLessonIncomplete({
      courseSlug: COURSE_SLUG,
      moduleSlug,
      chapterSlug: currentChapter.title,
      lessonSlug,
    })

    setCompletedSlugs((prev) => {
      const next = new Set(prev)
      next.delete(lessonSlug)
      return next
    })
  }, [currentChapter.title, moduleSlug])

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
        completedLessonSlugs={completedSlugs}
        onSelectLesson={handleSelectLesson}
      />
      <SanityLessonContent
        lesson={currentLesson}
        chapter={currentChapter}
        isCompleted={completedSlugs.has(currentLesson.slug)}
        onMarkComplete={() => handleMarkComplete(currentLesson.slug)}
        onMarkIncomplete={() => handleMarkIncomplete(currentLesson.slug)}
        onPrevious={() => navigate(-1)}
        onNext={() => navigate(1)}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < allItems.length - 1}
      />
    </div>
  )
}
