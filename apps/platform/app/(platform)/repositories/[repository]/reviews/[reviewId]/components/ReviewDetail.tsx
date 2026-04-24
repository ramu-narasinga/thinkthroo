"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitPullRequest, User, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { useReviewStore } from "@/store/review";
import { reviewSelectors } from "@/store/review/selectors";
import { reviewClientService } from "@/service/review";
import type { ReviewItem } from "@/store/review/initialState";
import { InlineReviewSection } from "./InlineReviewSection";
import { ArchitectureSection } from "./ArchitectureSection";

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

function SummarySection({ summaryPoints }: { summaryPoints: string[] }) {
  return (
    <section className="rounded-lg border p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold">Summary</h2>
      </div>
      <ul className="space-y-2.5">
        {summaryPoints.map((point, i) => {
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
    </section>
  );
}

export function ReviewDetail() {
  const params = useParams();
  const router = useRouter();
  const repositoryFullName = decodeURIComponent(params.repository as string);
  const reviewId = params.reviewId as string;

  const reviews = useReviewStore(reviewSelectors.reviews);
  const fetchReviews = useReviewStore((s) => s.fetchReviews);

  const [review, setReview] = React.useState<ReviewItem | null | undefined>(undefined);

  // Try to get review from store first; if not loaded yet, fetch it directly
  React.useEffect(() => {
    const found = reviews.find((r) => r.id === reviewId);
    if (found) {
      setReview(found);
      return;
    }
    // Not in store — fetch individually
    reviewClientService.getById(reviewId).then(setReview);
    // Also ensure the list is populated for future navigation
    fetchReviews(repositoryFullName);
  }, [reviewId, reviews, repositoryFullName, fetchReviews]);

  if (review === undefined) {
    return (
      <div className="px-6 py-8 text-sm text-muted-foreground text-center">
        Loading review…
      </div>
    );
  }

  if (review === null) {
    return (
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">Review not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Back link */}
      <div>
        <Link
          href={`/repositories/${encodeURIComponent(repositoryFullName)}/reviews`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Reviews
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{review.repositoryFullName}</p>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <GitPullRequest className="h-4 w-4 shrink-0" />
            <span>
              #{review.prNumber} –{" "}
              <a
                href={`https://github.com/${review.repositoryFullName}/pull/${review.prNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline inline-flex items-center gap-1"
              >
                {review.prTitle}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pt-1">
            {review.prAuthor && (
              <a
                href={`https://github.com/${review.prAuthor}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <User className="h-3 w-3" />
                {review.prAuthor}
              </a>
            )}
            <span>{formatRelativeDate(review.createdAt)}</span>
          </div>
        </div>

        <div className="shrink-0 text-right space-y-0.5">
          <p className="text-2xl font-bold tabular-nums">{review.creditsDeducted.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">credits</p>
        </div>
      </div>

      {/* Sections */}
      <SummarySection summaryPoints={review.summaryPoints} />
      <InlineReviewSection prReviewId={review.id} repositoryFullName={review.repositoryFullName} prNumber={review.prNumber} />
      <ArchitectureSection prReviewId={review.id} repoName={repositoryFullName} prNumber={review.prNumber} />
    </div>
  );
}
