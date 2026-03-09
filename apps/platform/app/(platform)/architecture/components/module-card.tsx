"use client"

import { type SanityModule } from "@/app/(platform)/architecture/lib/course-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Button } from "@thinkthroo/ui/components/button"
import { Badge } from "@thinkthroo/ui/components/badge"
import { BookOpen, PlayCircle, Tag } from "lucide-react"
import Link from "next/link"

interface ModuleCardProps {
  module: SanityModule
}

export function ModuleCard({ module }: ModuleCardProps) {
  const { title, description, slug, tags, chapterCount, lessonCount, chapter } = module

  const firstLessonHref =
    chapter?.chapterSlug && chapter?.lesson?.lessonSlug
      ? `/architecture/${slug}/${chapter.chapterSlug}/${chapter.lesson.lessonSlug}`
      : `/architecture/${slug}`

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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

        <div className="flex items-center gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={firstLessonHref}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
