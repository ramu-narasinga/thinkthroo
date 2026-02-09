"use client"

import { type Module, getModuleProgress, getNextLesson } from "@/app/(platform)/architecture/lib/course-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Progress } from "@thinkthroo/ui/components/progress"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { BookOpen, Clock, PlayCircle } from "lucide-react"
import Link from "next/link"

interface ModuleCardProps {
  module: Module
  categorySlug: string
}

export function ModuleCard({ module, categorySlug }: ModuleCardProps) {
  const progress = getModuleProgress(module)
  const nextLesson = getNextLesson(module)
  const totalLessons = module.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const totalChapters = module.chapters.length

  const totalDuration = module.chapters.reduce(
    (acc, ch) =>
      acc +
      ch.lessons.reduce((lAcc, l) => {
        const mins = Number.parseInt(l.duration)
        return lAcc + (isNaN(mins) ? 0 : mins)
      }, 0),
    0,
  )

  const lessonQuery =
    progress > 0 && progress < 100 && nextLesson
      ? `?lesson=${nextLesson.id}`
      : ""

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{module.title}</CardTitle>
            <CardDescription className="line-clamp-2">{module.description}</CardDescription>
          </div>
          {progress === 100 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>
              {totalChapters} chapters • {totalLessons} lessons
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{totalDuration} min</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/${categorySlug}/${module.slug}${lessonQuery}`}>

              <PlayCircle className="mr-2 h-4 w-4" />
              {progress === 0 ? "Start" : progress === 100 ? "Review" : "Resume"}
            </Link>
          </Button>
        </div>

        {nextLesson && progress > 0 && progress < 100 && (
          <p className="text-xs text-muted-foreground">
            Next: {nextLesson.title} ({nextLesson.duration})
          </p>
        )}
      </CardContent>
    </Card>
  )
}
