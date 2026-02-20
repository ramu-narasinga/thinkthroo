import * as React from "react";
import { cn } from "@thinkthroo/ui/lib/utils";
import { Button } from "@thinkthroo/ui/components/button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const siblings = 1;
  const boundary = 1;
  const startPages = range(1, Math.min(boundary, totalPages));
  const endPages = range(Math.max(totalPages - boundary + 1, boundary + 1), totalPages);
  const siblingsStart = Math.max(
    Math.min(page - siblings, totalPages - boundary - siblings * 2 - 1),
    boundary + 2
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblings, boundary + siblings * 2 + 2),
    (Array.isArray(endPages) && endPages.length > 0 && typeof endPages[0] === 'number') ? (endPages[0] as number) - 2 : totalPages - 1
  );

  const itemList = range(1, totalPages);

  return (
    <nav className={cn("flex items-center gap-2", className)} aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      {itemList.map((item, idx) =>
        typeof item === "number" ? (
          <Button
            key={`page-${item}-${idx}`}
            variant={item === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Button>
        ) : (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
            ...
          </span>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
