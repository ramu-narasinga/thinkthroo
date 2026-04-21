"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpDown, ArrowDown, GitPullRequest,
  ChevronLeft, ChevronRight,
  User, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { useReviewStore } from "@/store/review";
import { reviewSelectors } from "@/store/review/selectors";

type SortKey = "credits" | "date";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 5;

function formatRelativeDate(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDay = new Date(isoDate);
  reviewDay.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - reviewDay.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function SlackBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    sent:    { label: "Sent",    cls: "text-green-600 bg-green-50" },
    failed:  { label: "Failed",  cls: "text-red-600 bg-red-50" },
    skipped: { label: "Skipped", cls: "text-slate-500 bg-slate-100" },
    pending: { label: "Pending", cls: "text-slate-500 bg-slate-100" },
  };
  const { label, cls } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function ReviewsTab() {
  const params = useParams();
  const repositoryFullName = decodeURIComponent(params.repository as string);

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
    <div className="space-y-4">
      {/* Slack nudge banner */}
      <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        <span>Configure Slack to receive PR review notifications in your channel.</span>
        <Link href="/integrations" className="ml-4 shrink-0 font-medium underline underline-offset-2 hover:text-yellow-900">
          Set up Integrations →
        </Link>
      </div>

      <h2 className="text-xl font-semibold">Latest Summaries</h2>

      {/* Header row */}
      <div className="flex gap-4 border-b pb-2">
        <span className="flex-1 text-sm font-medium text-muted-foreground">Comment</span>
        <span className="w-20 text-right text-sm font-medium text-muted-foreground shrink-0">Author</span>
        <span className="w-20 text-right text-sm font-medium text-muted-foreground shrink-0">Slack</span>
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
        <span className="w-5 shrink-0" />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading reviews…</p>
      )}

      {!isLoading && isFirstFetchFinished && reviews.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No reviews yet. Reviews will appear here after your first PR is processed.
        </p>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="divide-y">
          {paginated.map((review) => (
            <Link
              key={review.id}
              href={`/repositories/${encodeURIComponent(repositoryFullName)}/reviews/${review.id}`}
              className="flex gap-4 py-5 hover:bg-slate-50/70 rounded-lg px-2 -mx-2 transition-colors group"
            >
              {/* Comment column */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm mb-0.5">{review.repositoryFullName}</p>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                  <GitPullRequest className="h-3.5 w-3.5 shrink-0" />
                  <span>#{review.prNumber} – {review.prTitle}</span>
                </div>
                <ul className="space-y-2">
                  {review.summaryPoints.slice(0, 3).map((point, i) => {
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
                  {review.summaryPoints.length > 3 && (
                    <li className="text-xs text-muted-foreground pl-4">
                      +{review.summaryPoints.length - 3} more…
                    </li>
                  )}
                </ul>
              </div>

              {/* Author */}
              <div className="w-20 text-right text-sm text-muted-foreground shrink-0">
                {review.prAuthor ? (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[60px]">{review.prAuthor}</span>
                  </span>
                ) : "—"}
              </div>

              {/* Slack */}
              <div className="w-20 text-right shrink-0">
                <SlackBadge status={review.slackStatus} />
              </div>

              {/* Credits */}
              <div className="w-24 text-right text-sm text-muted-foreground shrink-0">
                {review.creditsDeducted.toLocaleString()}
              </div>

              {/* Date */}
              <div className="w-28 text-right text-sm text-muted-foreground shrink-0 whitespace-nowrap">
                {formatRelativeDate(review.createdAt)}
              </div>

              {/* Arrow indicator */}
              <div className="w-5 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                <ChevronRightIcon className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      )}

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