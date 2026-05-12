"use client";

import { Skeleton } from "@thinkthroo/ui/components/skeleton";

export default function RepositoriesSkeleton() {
  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Subtitle */}
      <Skeleton className="h-4 w-72 mb-4" />

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Search + column toggle row */}
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Table header */}
      <div className="flex gap-4 mb-2 px-1">
        {[120, 200, 100, 80, 100].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-t px-1">
          {[120, 200, 100, 80, 100].map((w, j) => (
            <Skeleton key={j} className="h-4" style={{ width: w }} />
          ))}
        </div>
      ))}
    </div>
  );
}
