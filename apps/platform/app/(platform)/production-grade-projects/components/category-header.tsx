"use client";

import { useEffect, useState } from "react";
import { type Category } from "@/app/(platform)/production-grade-projects/lib/course-data";
import { Progress } from "@thinkthroo/ui/components/progress";
import { BookOpen, Code2 } from "lucide-react";
import { courseProgressClient } from "@/service/courseProgress/client";

const COURSE_SLUG = "production-grade-projects";

interface CategoryHeaderProps {
  category: Category;
  /** Total lesson count from Sanity — passed down by the server page */
  totalLessons: number;
  totalModules: number;
}

export function CategoryHeader({ category, totalLessons, totalModules }: CategoryHeaderProps) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    courseProgressClient
      .getCompletedLessons({ courseSlug: COURSE_SLUG })
      .then((rows) => setCompletedCount(rows.length))
      .catch(console.error);
  }, []);

  const progress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="border-b border-border bg-background px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {category.slug === "codebase-architecture" ? (
              <Code2 className="h-5 w-5 text-primary" />
            ) : (
              <BookOpen className="h-5 w-5 text-primary" />
            )}
            <h1 className="text-2xl font-bold tracking-tight">
              {category.title}
            </h1>
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
  );
}
