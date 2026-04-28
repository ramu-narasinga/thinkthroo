"use client";

import React from "react";
import { FileText } from "lucide-react";
import { useReviewStore } from "@/store/review";
import { reviewSelectors } from "@/store/review/selectors";
import type { InlineReviewComment } from "@/store/review/initialState";

function groupByFile(
  comments: InlineReviewComment[]
): Record<string, InlineReviewComment[]> {
  return comments.reduce<Record<string, InlineReviewComment[]>>((acc, c) => {
    if (!acc[c.filename]) acc[c.filename] = [];
    acc[c.filename].push(c);
    return acc;
  }, {});
}

export function InlineReviewSection({
  prReviewId,
  repositoryFullName,
  prNumber,
}: {
  prReviewId: string;
  repositoryFullName: string;
  prNumber: number;
}) {
  const fetchInlineReviews = useReviewStore((s) => s.fetchInlineReviews);
  const comments = useReviewStore(reviewSelectors.inlineReviews(prReviewId));
  const isLoading = useReviewStore(reviewSelectors.isInlineLoading(prReviewId));

  React.useEffect(() => {
    fetchInlineReviews(prReviewId);
  }, [prReviewId, fetchInlineReviews]);

  return (
    <section className="rounded-lg border p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-foreground">
          <FileText className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold">Line-by-line Review</h2>
        {!isLoading && comments.length > 0 && (
          <span className="ml-1 text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          Loading inline review comments…
        </p>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No inline review comments were recorded for this PR.
        </p>
      )}

      {!isLoading && comments.length > 0 && (() => {
        const byFile = groupByFile(comments);
        return (
          <div className="space-y-5">
            {Object.entries(byFile).map(([filename, fileComments]) => (
              <div key={filename} className="space-y-2">
                <p className="font-mono text-xs text-slate-600 bg-slate-50 border rounded px-2 py-1 break-all">
                  <a
                    href={`https://github.com/${repositoryFullName}/pull/${prNumber}/files`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {filename}
                  </a>
                  <span className="ml-2 text-muted-foreground font-sans">
                    {fileComments.length}{" "}
                    {fileComments.length === 1 ? "comment" : "comments"}
                  </span>
                </p>
                <div className="space-y-2 pl-3 border-l-2 border-slate-200">
                  {fileComments.map((c) => (
                    <div key={c.id} className="rounded border bg-white p-3 text-sm">
                      <p className="text-xs font-medium text-slate-500 mb-1.5">
                        L{c.startLine}
                        {c.startLine !== c.endLine ? `–${c.endLine}` : ""}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {c.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </section>
  );
}
