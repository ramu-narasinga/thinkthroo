import { BookOpen } from "lucide-react";

interface CategoryHeaderProps {
  totalSkills: number;
}

export function CategoryHeader({ totalSkills }: CategoryHeaderProps) {
  return (
    <div className="border-b border-border bg-background px-6 py-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Skills Library</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{totalSkills} {totalSkills === 1 ? "skill" : "skills"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
