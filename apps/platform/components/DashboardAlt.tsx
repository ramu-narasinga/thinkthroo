"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Progress } from "@thinkthroo/ui/components/progress"
import { Button } from "@thinkthroo/ui/components/button"
import { dashboardCourses } from "@/lib/course-data"
import type { CourseStat } from "@/lib/learning-dashboard-stats"
import { courseProgressClient } from "@/service/courseProgress/client"
import { BookOpen, Code2, PlayCircle, Clock, Trophy } from "lucide-react"
import Link from "next/link"

interface DashboardAltPageProps {
  courseStats: CourseStat[]
}

export default function DashboardAltPage({ courseStats }: DashboardAltPageProps) {
  const [completedByCourse, setCompletedByCourse] = useState<Record<string, number>>({})

  const statsByCourseSlug = useMemo(
    () => Object.fromEntries(courseStats.map((s) => [s.courseSlug, s])),
    [courseStats],
  )

  useEffect(() => {
    Promise.all(
      dashboardCourses.map(async (course) => {
        const rows = await courseProgressClient.getCompletedLessons({
          courseSlug: course.courseSlug,
        })
        return [course.courseSlug, rows.length] as const
      }),
    )
      .then((entries) => setCompletedByCourse(Object.fromEntries(entries)))
      .catch(console.error)
  }, [])

  const totalLessons = courseStats.reduce((acc, s) => acc + s.totalLessons, 0)
  const completedLessons = Object.values(completedByCourse).reduce((acc, n) => acc + n, 0)
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground mt-1">Continue your learning journey</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall Progress</CardDescription>
            <CardTitle className="text-3xl">{overallProgress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lessons Completed</CardDescription>
            <CardTitle className="text-3xl">
              {completedLessons}/{totalLessons}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">lessons</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Time Invested</CardDescription>
            <CardTitle className="text-3xl">2.5h</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">this week</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Achievements</CardDescription>
            <CardTitle className="text-3xl">3</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">badges earned</span>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {dashboardCourses.map((course) => {
            const stats = statsByCourseSlug[course.courseSlug]
            const moduleCount = stats?.moduleCount ?? 0
            const courseTotalLessons = stats?.totalLessons ?? 0
            const courseCompleted = completedByCourse[course.courseSlug] ?? 0
            const progress =
              courseTotalLessons > 0
                ? Math.round((courseCompleted / courseTotalLessons) * 100)
                : 0
            const Icon = course.slug === "codebase-architecture" ? Code2 : BookOpen
            const moduleLabel = moduleCount === 1 ? "module" : "modules"

            return (
              <Card key={course.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>
                        {moduleCount} {moduleLabel}
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
                    <Link href={course.path}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      {progress === 0 ? "Start Learning" : "Continue"}
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
