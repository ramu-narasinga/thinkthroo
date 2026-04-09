"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowUpDown, ArrowDown, GitPullRequest, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { useReviewStore } from "@/store/review";
import { reviewSelectors } from "@/store/review/selectors";
import { useOrganizationStore } from "@/store/organization";
import { organizationSelectors } from "@/store/organization/selectors";

type SortKey = "credits" | "date";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 5;

function formatRelativeDate(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function ReviewsTab() {
  const params = useParams();
  const repoName = decodeURIComponent(params.repository as string);
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
  const repositoryFullName = activeOrg?.login ? `${activeOrg.login}/${repoName}` : repoName;

  const reviews = useReviewStore(reviewSelectors.reviews);
  const isLoading = useReviewStore(reviewSelectors.isReviewsLoading);
  const isFirstFetchFinished = useReviewStore(reviewSelectors.isFirstFetchFinished);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    fetchReviews(repositoryFullName);
  }, [repositoryFullName, fetchReviews]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const sorted = [...reviews].sort((a, b) => {
    if (sortKey === "credits") {
      return sortDir === "asc"
        ? a.creditsDeducted - b.creditsDeducted
        : b.creditsDeducted - a.creditsDeducted;
    }
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return sortDir === "asc" ? aTime - bTime : bTime - aTime;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <ArrowDown className={`inline h-3.5 w-3.5 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
    ) : (
      <ArrowUpDown className="inline h-3.5 w-3.5 text-muted-foreground" />
    );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Latest Summaries</h2>

      {/* Header row */}
      <div className="flex gap-4 border-b pb-2">
        <span className="flex-1 text-sm font-medium text-muted-foreground">Comment</span>
        <button
          type="button"
          onClick={() => handleSort("credits")}
          className="w-24 text-right text-sm font-medium text-muted-foreground shrink-0 flex items-center justify-end gap-1"
        >
          <SortIcon col="credits" /> Credits
        </button>
        <button
          type="button"
          onClick={() => handleSort("date")}
          className="w-28 text-right text-sm font-medium text-muted-foreground shrink-0 flex items-center justify-end gap-1"
        >
          <SortIcon col="date" /> Date
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading reviews…</p>
      )}

      {/* Empty state */}
      {!isLoading && isFirstFetchFinished && reviews.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No reviews yet. Reviews will appear here after your first PR is processed.
        </p>
      )}

      {/* Rows */}
      {!isLoading && reviews.length > 0 && (
        <div className="divide-y">
          {paginated.map((review) => (
            <div key={review.id} className="flex gap-4 py-5">
              {/* Comment column */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm mb-0.5">{review.repositoryFullName}</p>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                  <GitPullRequest className="h-3.5 w-3.5 shrink-0" />
                  <span>#{review.prNumber} – {review.prTitle}</span>
                </div>
                <ul className="space-y-2">
                  {review.summaryPoints.map((point, i) => {
                    const colonIdx = point.indexOf(":");
                    const bold = colonIdx !== -1 ? point.slice(0, colonIdx) : null;
                    const rest = colonIdx !== -1 ? point.slice(colonIdx + 1) : point;
                    return (
                      <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span>
                          {bold && <strong>{bold}:</strong>}
                          {rest}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {/* Credits */}
              <div className="w-24 text-right text-sm text-muted-foreground shrink-0">
                {review.creditsDeducted.toLocaleString()}
              </div>
              {/* Date */}
              <div className="w-28 text-right text-sm text-muted-foreground shrink-0 whitespace-nowrap">
                {formatRelativeDate(review.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && reviews.length > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
