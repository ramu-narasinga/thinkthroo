"use client";

import { Skeleton } from "@thinkthroo/ui/components/skeleton";

export default function ArchitectureSkeleton() {
  return (
    <div className="flex bg-white rounded overflow-hidden" style={{ minHeight: 'calc(100vh - 160px)' }}>
      {/* File Tree Sidebar */}
      <div className="w-56 shrink-0 border-r border-slate-200 p-3 flex flex-col gap-2">
        {/* Sidebar header */}
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-1">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
        {/* Tree rows */}
        {[
          { indent: 0, width: 140 },
          { indent: 16, width: 110 },
          { indent: 16, width: 120 },
          { indent: 0, width: 100 },
          { indent: 16, width: 130 },
          { indent: 32, width: 90 },
          { indent: 0, width: 115 },
        ].map((row, i) => (
          <div key={i} className="flex items-center gap-2" style={{ paddingLeft: row.indent }}>
            <Skeleton className="h-4 w-4 shrink-0" />
            <Skeleton className="h-4" style={{ width: row.width }} />
          </div>
        ))}
        {/* Storage bar at bottom */}
        <div className="mt-auto pt-4 flex flex-col gap-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Editor Panel placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-5 w-36" />
      </div>
    </div>
  );
}
