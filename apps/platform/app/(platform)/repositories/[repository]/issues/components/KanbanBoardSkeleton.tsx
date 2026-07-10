"use client";

import { Skeleton } from "@thinkthroo/ui/components/skeleton";
import { COLUMN_ORDER } from "./kanbanConfig";

const CARD_COUNTS = [3, 2, 4, 1, 2, 1];

export default function KanbanBoardSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
        {COLUMN_ORDER.map((status, i) => (
          <div key={status} className="flex flex-col min-w-[240px] w-[240px] shrink-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-4 ml-auto" />
            </div>

            {/* Drop zone */}
            <div className="flex-1 rounded-xl p-2 space-y-2 min-h-[120px] bg-muted/20">
              {Array.from({ length: CARD_COUNTS[i % CARD_COUNTS.length] }).map((_, j) => (
                <div key={j} className="bg-background border rounded-lg p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-3 w-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
