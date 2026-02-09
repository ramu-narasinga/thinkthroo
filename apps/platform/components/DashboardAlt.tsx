"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Progress } from "@thinkthroo/ui/components/progress"
import { Button } from "@thinkthroo/ui/components/button"
import { courseData, getCategoryProgress } from "@/lib/course-data"
import { BookOpen, Code2, PlayCircle, Clock, Trophy } from "lucide-react"
import Link from "next/link"

export default function DashboardAltPage() {
  const totalLessons = courseData.reduce(
    (acc, cat) =>
      acc + cat.modules.reduce((mAcc, m) => mAcc + m.chapters.reduce((chAcc, ch) => chAcc + ch.lessons.length, 0), 0),
    0,
  )

  const completedLessons = courseData.reduce(
    (acc, cat) =>
      acc +
      cat.modules.reduce(
        (mAcc, m) => mAcc + m.chapters.reduce((chAcc, ch) => chAcc + ch.lessons.filter((l) => l.completed).length, 0),
        0,
      ),
    0,
  )

  const overallProgress = Math.round((completedLessons / totalLessons) * 100)

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
                {courseData.map((category) => {
                  const progress = getCategoryProgress(category)
                  const Icon = category.slug === "codebase-architecture" ? Code2 : BookOpen

                  return (
                    <Card key={category.id} className="group hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{category.title}</CardTitle>
                            <CardDescription>{category.modules.length} modules</CardDescription>
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
                          <Link href={`/learn/${category.slug}`}>
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
