"use client"

import { useState, useEffect } from "react"
import { type SanityModule } from "@/app/(platform)/architecture/lib/course-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Progress } from "@thinkthroo/ui/components/progress"
import { BookOpen, PlayCircle, RotateCcw, Tag } from "lucide-react"
import Link from "next/link"
import { courseProgressClient } from "@/service/courseProgress/client"

const COURSE_SLUG = "production-grade-projects"

interface ModuleCardProps {
  module: SanityModule
}

type EnrollmentState = "start" | "resume" | "restart"

export function ModuleCard({ module }: ModuleCardProps) {
  const { title, description, slug, tags, chapterCount, lessonCount, chapter } = module

  const firstLessonHref =
    chapter?.chapterSlug && chapter?.lesson?.lessonSlug
      ? `/production-grade-projects/${slug}/${chapter.chapterSlug}/${chapter.lesson.lessonSlug}`
      : `/production-grade-projects/${slug}`

  const [ctaState, setCtaState] = useState<EnrollmentState>("start")
  const [resumeHref, setResumeHref] = useState<string>(firstLessonHref)
  const [progressPercent, setProgressPercent] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [enrollment, completedLessons] = await Promise.all([
        courseProgressClient.getEnrollment({ courseSlug: COURSE_SLUG, moduleSlug: slug }),
        courseProgressClient.getCompletedLessons({ courseSlug: COURSE_SLUG, moduleSlug: slug }),
      ])

      const completed = completedLessons.length
      setCompletedCount(completed)
      setProgressPercent(
        lessonCount > 0 ? Math.round((completed / lessonCount) * 100) : 0
      )

      if (!enrollment) {
        setCtaState("start")
        return
      }

      const isFinished = lessonCount > 0 && completed >= lessonCount
      if (isFinished) {
        setCtaState("restart")
        setResumeHref(firstLessonHref)
      } else if (enrollment.lastChapterSlug && enrollment.lastLessonSlug) {
        setCtaState("resume")
        setResumeHref(
          `/production-grade-projects/${slug}/${enrollment.lastChapterSlug}/${enrollment.lastLessonSlug}`
        )
      } else {
        setCtaState("start")
      }
    }

    load().catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const ctaConfig = {
    start:   { label: "Start",   Icon: PlayCircle,  href: firstLessonHref },
    resume:  { label: "Resume",  Icon: PlayCircle,  href: resumeHref },
    restart: { label: "Restart", Icon: RotateCcw,   href: firstLessonHref },
  }[ctaState]

  return (
    <Card className="group hover:shadow-md transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>
              {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"} • {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
            </span>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                <Tag className="h-3 w-3" />
                {tag.title}
              </Badge>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {completedCount} / {lessonCount} lessons
          </p>
        </div>

        <div className="mt-auto pt-2">
          <Button asChild className="w-full">
            <Link href={ctaConfig.href}>
              <ctaConfig.Icon className="mr-2 h-4 w-4" />
              {ctaConfig.label}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
