"use client";

import { Skeleton } from "@thinkthroo/ui/components/skeleton";

const PROPERTY_SECTIONS = ["Status", "Priority", "Mode", "Assignees", "Labels", "Pull Requests", "Details", "Execution log"];

export function IssueDetailSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      {/* Issue header */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-24 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      <div className="flex gap-8 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-4">
          <Skeleton className="h-4 w-24" />

          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/10">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="px-4 py-3 border-t space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className="h-20 flex-1 rounded-md" />
          </div>
        </div>

        {/* Properties panel */}
        <aside className="w-56 shrink-0 self-start">
          <div className="rounded-lg border divide-y">
            {PROPERTY_SECTIONS.map((section) => (
              <div key={section} className="px-4 py-3 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
