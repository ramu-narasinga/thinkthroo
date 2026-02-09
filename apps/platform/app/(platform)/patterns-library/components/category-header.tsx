"use client";

import { type Category, getCategoryProgress } from "@/lib/course-data";
import { Progress } from "@thinkthroo/ui/components/progress";
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs";
import { BookOpen, Code2 } from "lucide-react";
import { usePathname } from "next/navigation";

interface CategoryHeaderProps {
  category: Category;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  const pathname = usePathname();
  const progress = getCategoryProgress(category);
  const totalModules = category.modules.length;
  const totalLessons = category.modules.reduce(
    (acc, m) =>
      acc + m.chapters.reduce((chAcc, ch) => chAcc + ch.lessons.length, 0),
    0
  );

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
              <h1 className="text-2xl font-bold tracking-tight">
                {category.title}
              </h1>
            </div>
            
          </div>
          {/* Progress percentage removed as requested */}
        </div>
        {/* Progress bar removed as requested */}
      </div>

      {/* <div className="px-6">
        <Tabs value="modules">
          <TabsList>
            <TabsTrigger value="modules" className="cursor-pointer">Modules</TabsTrigger>
            <TabsTrigger value="overview" className="cursor-pointer">Overview</TabsTrigger>
            <TabsTrigger value="resources" className="cursor-pointer">Resources</TabsTrigger>
          </TabsList>
        </Tabs>
      </div> */}
    </div>
  );
}
