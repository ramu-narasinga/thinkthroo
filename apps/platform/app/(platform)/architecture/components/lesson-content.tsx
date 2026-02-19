"use client"

import type { Chapter, Lesson } from "@/app/(platform)/architecture/lib/course-data"
import { Badge } from "@thinkthroo/ui/components/badge"
import { Button } from "@thinkthroo/ui/components/button"
import { Separator } from "@thinkthroo/ui/components/separator"
import { Check, ChevronLeft, ChevronRight, Clock, FileText, PlayCircle, HelpCircle } from "lucide-react"

interface LessonContentProps {
  lesson: Lesson
  chapter: Chapter
  onMarkComplete: (lessonId: string) => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious: boolean
  hasNext: boolean
}

const lessonTypeLabels = {
  video: { label: "Video Lesson", icon: PlayCircle },
  article: { label: "Article", icon: FileText },
  quiz: { label: "Quiz", icon: HelpCircle },
}

export function LessonContent({
  lesson,
  chapter,
  onMarkComplete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: LessonContentProps) {
  const typeInfo = lessonTypeLabels[lesson.type]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{chapter.title}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{lesson.title}</span>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            {lesson.completed ? "Completed" : "Saved"}
          </Badge>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-4">{lesson.title}</h1>

        <div className="flex items-center gap-4 mb-8">
          <Badge variant="secondary" className="gap-1.5">
            <typeInfo.icon className="h-3.5 w-3.5" />
            {typeInfo.label}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{lesson.duration}</span>
          </div>
        </div>

        {lesson.type === "video" && (
          <div className="aspect-video bg-muted rounded-lg mb-8 flex items-center justify-center">
            <div className="text-center">
              <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Video Player Placeholder</p>
            </div>
          </div>
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            In this {lesson.type === "video" ? "lesson" : lesson.type}, we will cover the essential concepts of{" "}
            <strong>{lesson.title}</strong>. This content is part of the <strong>{chapter.title}</strong> chapter.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Learning Objectives</h2>
          <ul className="space-y-2 list-disc list-inside text-muted-foreground">
            <li>Understand the core concepts and principles</li>
            <li>Learn practical implementation techniques</li>
            <li>Apply best practices in real-world scenarios</li>
            <li>Explore common patterns and anti-patterns</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Key Takeaways</h2>
          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">
              By the end of this {lesson.type}, you should be able to confidently implement these concepts in your own
              projects and understand when to apply different approaches based on your specific requirements.
            </p>
          </div>

          {lesson.type === "article" && (
            <>
              <h2 className="text-xl font-semibold mt-8 mb-4">Code Example</h2>
              <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>
                  <code>{`import axios from "@/lib/axiosConfig";

// Example implementation
const fetchData = async () => {
  try {
    const response = await axios.get('/api/data');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};`}</code>
                </pre>
              </div>
            </>
          )}
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onPrevious} disabled={!hasPrevious}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button onClick={() => onMarkComplete(lesson.id)} variant={lesson.completed ? "secondary" : "default"}>
            <Check className="mr-2 h-4 w-4" />
            {lesson.completed ? "Completed" : "Mark as Complete"}
          </Button>

          <Button variant="outline" onClick={onNext} disabled={!hasNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
