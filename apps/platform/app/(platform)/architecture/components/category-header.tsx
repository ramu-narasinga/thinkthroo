"use client"

import { type Category, getCategoryProgress } from "@/lib/course-data"
import { Progress } from "@thinkthroo/ui/components/progress"
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs"
import { BookOpen, Code2 } from "lucide-react"
import { usePathname } from "next/navigation"

interface CategoryHeaderProps {
  category: Category
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  const pathname = usePathname()
  const progress = getCategoryProgress(category)
  const totalModules = category.modules.length
  const totalLessons = category.modules.reduce(
    (acc, m) => acc + m.chapters.reduce((chAcc, ch) => chAcc + ch.lessons.length, 0),
    0,
  )

  return (
    <div className="border-b border-border bg-background">
      <div className="px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {category.slug === "codebase-architecture" ? (
                <Code2 className="h-5 w-5 text-primary" />
              ) : (
                <BookOpen className="h-5 w-5 text-primary" />
              )}
              <h1 className="text-2xl font-bold tracking-tight">{category.title}</h1>
            </div>
            <p className="text-muted-foreground">
              {totalModules} modules • {totalLessons} lessons
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
            <p className="text-2xl font-bold">{progress}%</p>
          </div>
        </div>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      <div className="px-6">
        <Tabs value="modules" className="w-full">
          <TabsList className="h-auto p-0 bg-transparent border-b-0">
            <TabsTrigger
              value="modules"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Modules
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="resources"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Resources
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
