"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, CircleDot, CircleCheck, ExternalLink, User } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";
import { useIssueStore } from "@/store/issues";
import { issueSelectors } from "@/store/issues/selectors";
import { IssueState } from "@/store/issues/initialState";

function formatRelativeDate(isoDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(isoDate);
  day.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function IssuesTab() {
  const params = useParams();
  const repositoryFullName = decodeURIComponent(params.repository as string);

  const issues = useIssueStore(issueSelectors.issues);
  const isLoading = useIssueStore(issueSelectors.isLoading);
  const isFirstFetchFinished = useIssueStore(issueSelectors.isFirstFetchFinished);
  const page = useIssueStore(issueSelectors.page);
  const hasMore = useIssueStore(issueSelectors.hasMore);
  const stateFilter = useIssueStore(issueSelectors.stateFilter);
  const fetchIssues = useIssueStore((s) => s.fetchIssues);
  const setStateFilter = useIssueStore((s) => s.setStateFilter);

  React.useEffect(() => {
    fetchIssues(repositoryFullName, 1, stateFilter);
  }, [repositoryFullName, stateFilter, fetchIssues]);

  const handleStateToggle = (state: IssueState) => {
    setStateFilter(state);
  };

  const handlePrev = () => {
    const prevPage = Math.max(1, page - 1);
    fetchIssues(repositoryFullName, prevPage, stateFilter);
  };

  const handleNext = () => {
    fetchIssues(repositoryFullName, page + 1, stateFilter);
  };

  return (
    <div className="space-y-4">
      {/* State filter toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleStateToggle("open")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            stateFilter === "open"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <CircleDot className="h-3.5 w-3.5" />
          Open
        </button>
        <button
          type="button"
          onClick={() => handleStateToggle("closed")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            stateFilter === "closed"
              ? "bg-purple-100 text-purple-800 border border-purple-300"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <CircleCheck className="h-3.5 w-3.5" />
          Closed
        </button>
      </div>

      {/* Header row */}
      <div className="flex gap-4 border-b pb-2">
        <span className="flex-1 text-sm font-medium text-muted-foreground">Issue</span>
        <span className="w-24 text-right text-sm font-medium text-muted-foreground shrink-0">Author</span>
        <span className="w-28 text-right text-sm font-medium text-muted-foreground shrink-0">Opened</span>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading issues…</p>
      )}

      {!isLoading && isFirstFetchFinished && issues.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No {stateFilter} issues found for this repository.
        </p>
      )}

      {!isLoading && issues.length > 0 && (
        <div className="divide-y">
          {issues.map((issue) => (
            <div key={issue.id} className="flex gap-4 py-4 items-start">
              {/* Issue info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {issue.state === "open" ? (
                    <CircleDot className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <CircleCheck className="h-4 w-4 text-purple-600 shrink-0" />
                  )}
                  <a
                    href={issue.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm hover:underline inline-flex items-center gap-1"
                  >
                    {issue.title}
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </a>
                </div>
                <p className="text-xs text-muted-foreground ml-5.5">#{issue.number}</p>
                {issue.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 ml-5.5">
                    {issue.labels.map((label) => (
                      <span
                        key={label.name}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `#${label.color}22`,
                          color: `#${label.color}`,
                          border: `1px solid #${label.color}55`,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="w-24 text-right text-sm text-muted-foreground shrink-0">
                <span className="inline-flex items-center justify-end gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[60px]">{issue.author}</span>
                </span>
              </div>

              {/* Date */}
              <div className="w-28 text-right text-sm text-muted-foreground shrink-0 whitespace-nowrap">
                {formatRelativeDate(issue.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && isFirstFetchFinished && (page > 1 || hasMore) && (
        <div className="flex items-center justify-end gap-3 pt-2 pb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
