"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpDown, ArrowDown, GitPullRequest,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  User, AlertTriangle, FileText,
} from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { useReviewStore } from "@/store/review";
import { reviewSelectors } from "@/store/review/selectors";
import { useOrganizationStore } from "@/store/organization";
import { organizationSelectors } from "@/store/organization/selectors";
import { ArchitectureFileResult } from "@/store/review/initialState";

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

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-green-600 bg-green-50" :
    score >= 50 ? "text-yellow-600 bg-yellow-50" :
    "text-red-600 bg-red-50";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {score}
    </span>
  );
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

function ArchitecturePanel({ prReviewId, repoName }: { prReviewId: string; repoName: string }) {
  const fetchArchitectureResults = useReviewStore((s) => s.fetchArchitectureResults);
  const results = useReviewStore(reviewSelectors.architectureResults(prReviewId));
  const isLoading = useReviewStore(reviewSelectors.isArchitectureLoading(prReviewId));

  React.useEffect(() => {
    fetchArchitectureResults(prReviewId);
  }, [prReviewId, fetchArchitectureResults]);

  if (isLoading) {
    return <p className="text-xs text-muted-foreground py-3">Loading architecture results…</p>;
  }

  if (results.length === 0) {
    return <p className="text-xs text-muted-foreground py-3">No architecture file results recorded.</p>;
  }

  return (
    <div className="mt-3 rounded border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left">
          <tr>
            <th className="px-3 py-2 font-medium text-muted-foreground">File</th>
            <th className="px-3 py-2 font-medium text-muted-foreground w-16 text-center">Score</th>
            <th className="px-3 py-2 font-medium text-muted-foreground w-20 text-center">Violations</th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Doc References</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {results.map((file: ArchitectureFileResult) => (
            <tr key={file.id} className="hover:bg-slate-50/60">
              <td className="px-3 py-2 font-mono text-xs break-all">{file.filename}</td>
              <td className="px-3 py-2 text-center"><ScoreBadge score={file.score} /></td>
              <td className="px-3 py-2 text-center text-muted-foreground">{file.violationCount}</td>
              <td className="px-3 py-2">
                {file.docReferences.length === 0 ? (
                  <span className="text-muted-foreground text-xs">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {file.docReferences.map((ref, i) =>
                      ref.documentId ? (
                        <Link
                          key={i}
                          href={`/repositories/${repoName}/architecture?doc=${ref.documentId}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          title={ref.excerpt}
                        >
                          <FileText className="h-3 w-3 shrink-0" />
                          {ref.name}
                        </Link>
                      ) : (
                        <span key={i} className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={ref.excerpt}>
                          <FileText className="h-3 w-3 shrink-0" />
                          {ref.name}
                        </span>
                      )
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    fetchReviews(repositoryFullName);
  }, [repositoryFullName, fetchReviews]);

  // Auto-expand all rows once loaded
  React.useEffect(() => {
    if (reviews.length > 0) {
      setExpanded((prev) => {
        const next = { ...prev };
        reviews.forEach((r) => { if (!(r.id in next)) next[r.id] = true; });
        return next;
      });
    }
  }, [reviews]);

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
            <div key={review.id} className="py-5">
              {/* Main row */}
              <div className="flex gap-4">
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

                {/* Author */}
                <div className="w-20 text-right text-sm text-muted-foreground shrink-0">
                  {review.prAuthor ? (
                    <a
                      href={`https://github.com/${review.prAuthor}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[60px]">{review.prAuthor}</span>
                    </a>
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
              </div>

              {/* Architecture panel toggle */}
              <button
                type="button"
                onClick={() => setExpanded((prev) => ({ ...prev, [review.id]: !prev[review.id] }))}
                className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {expanded[review.id]
                  ? <><ChevronUp className="h-3.5 w-3.5" /> Hide architecture report</>
                  : <><ChevronDown className="h-3.5 w-3.5" /> Show architecture report</>
                }
              </button>

              {expanded[review.id] && (
                <ArchitecturePanel prReviewId={review.id} repoName={repoName} />
              )}
            </div>
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


