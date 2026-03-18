"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Progress } from "@thinkthroo/ui/components/progress"
import { Button } from "@thinkthroo/ui/components/button"
import { courseProgressClient } from "@/service/courseProgress/client"
import { BookOpen, Code2, PlayCircle, RotateCcw, Clock, Trophy } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@thinkthroo/ui/components/skeleton"

// ── Types from the stats API ─────────────────────────────────────────

interface ModuleStat {
  slug: string
  title: string
  lessonCount: number
  firstLessonHref: string
}

interface CourseStat {
  courseSlug: string
  title: string
  modules: ModuleStat[]
  totalLessons: number
}

// ── Static display config keyed by courseSlug ─────────────────────────

const COURSE_CONFIG: Record<
  string,
  { icon: React.ElementType; href: string }
> = {
  architecture: { icon: Code2, href: "/architecture" },
  "production-grade-projects": { icon: BookOpen, href: "/production-grade-projects" },
}

// ── Component ─────────────────────────────────────────────────────────

export default function DashboardAltPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<CourseStat[]>([])
  const [completedSlugs, setCompletedSlugs] = useState<
    { courseSlug: string; moduleSlug: string; lessonSlug: string }[]
  >([])
  const [enrollments, setEnrollments] = useState<
    {
      courseSlug: string
      moduleSlug: string
      lastChapterSlug: string | null
      lastLessonSlug: string | null
      lastAccessedAt: string
    }[]
  >([])

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, completed, enrolled] = await Promise.all([
          fetch("/api/dashboard/stats").then((r) => r.json() as Promise<CourseStat[]>),
          courseProgressClient.getCompletedLessons({}),
          courseProgressClient.getAllEnrollments(),
        ])

        setCourses(statsRes)
        setCompletedSlugs(
          completed.map((r) => ({
            courseSlug: r.courseSlug,
            moduleSlug: r.moduleSlug,
            lessonSlug: r.lessonSlug,
          }))
        )
        setEnrollments(enrolled as typeof enrollments)
      } finally {
        setLoading(false)
      }
    }
    load().catch(console.error)
  }, [])

  // ── Aggregates ───────────────────────────────────────────────────────

  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0)
  const completedCount = completedSlugs.length
  const overallProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // Per-course helpers
  const completedForCourse = (courseSlug: string) =>
    completedSlugs.filter((l) => l.courseSlug === courseSlug).length

  const progressForCourse = (course: CourseStat) => {
    const done = completedForCourse(course.courseSlug)
    return course.totalLessons > 0
      ? Math.round((done / course.totalLessons) * 100)
      : 0
  }

  /** Find the most-recently-accessed enrollment for a course */
  const latestEnrollment = (courseSlug: string) => {
    const rows = enrollments
      .filter((e) => e.courseSlug === courseSlug)
      .sort(
        (a, b) =>
          new Date(b.lastAccessedAt).getTime() -
          new Date(a.lastAccessedAt).getTime()
      )
    return rows[0] ?? null
  }

  const ctaForCourse = (
    course: CourseStat
  ): { label: string; href: string; Icon: React.ElementType } => {
    const enrollment = latestEnrollment(course.courseSlug)
    const done = completedForCourse(course.courseSlug)
    const config = COURSE_CONFIG[course.courseSlug]
    const fallbackHref = config?.href ?? `/${course.courseSlug}`

    if (!enrollment) {
      return { label: "Start Learning", href: fallbackHref, Icon: PlayCircle }
    }

    if (course.totalLessons > 0 && done >= course.totalLessons) {
      return { label: "Restart", href: fallbackHref, Icon: RotateCcw }
    }

    const resumeHref =
      enrollment.lastChapterSlug && enrollment.lastLessonSlug
        ? `/${course.courseSlug}/${enrollment.moduleSlug}/${enrollment.lastChapterSlug}/${enrollment.lastLessonSlug}`
        : fallbackHref

    return { label: "Continue", href: resumeHref, Icon: PlayCircle }
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Continue your learning journey</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall Progress</CardDescription>
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <CardTitle className="text-3xl">{overallProgress}%</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <Progress value={loading ? 0 : overallProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lessons Completed</CardDescription>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <CardTitle className="text-3xl">
                {completedCount}/{totalLessons}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">lessons</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time Invested</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">coming soon</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Achievements</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">coming soon</span>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {loading
            ? [0, 1].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-40 mt-2" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            : courses.map((course) => {
                const progress = progressForCourse(course)
                const cta = ctaForCourse(course)
                const config = COURSE_CONFIG[course.courseSlug]
                const Icon = config?.icon ?? BookOpen

                return (
                  <Card key={course.courseSlug} className="group hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>
                            {course.modules.length}{" "}
                            {course.modules.length === 1 ? "module" : "modules"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <Button asChild className="w-full">
                        <Link href={cta.href}>
                          <cta.Icon className="mr-2 h-4 w-4" />
                          {cta.label}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
        </div>
      </div>
    </div>
  )
}
