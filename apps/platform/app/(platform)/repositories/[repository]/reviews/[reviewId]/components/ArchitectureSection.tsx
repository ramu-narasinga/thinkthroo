"use client";

import React from "react";
import Link from "next/link";
import { Shield, FileText } from "lucide-react";
import { useReviewStore } from "@/store/review";
import { reviewSelectors } from "@/store/review/selectors";
import type { ArchitectureFileResult } from "@/store/review/initialState";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-50 border-green-200"
      : score >= 50
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-red-600 bg-red-50 border-red-200";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-semibold ${color}`}
    >
      {score}
    </span>
  );
}

export function ArchitectureSection({
  prReviewId,
  repoName,
  prNumber,
}: {
  prReviewId: string;
  repoName: string;
  prNumber: number;
}) {
  const fetchArchitectureResults = useReviewStore(
    (s) => s.fetchArchitectureResults
  );
  const results = useReviewStore(reviewSelectors.architectureResults(prReviewId));
  const isLoading = useReviewStore(
    reviewSelectors.isArchitectureLoading(prReviewId)
  );

  React.useEffect(() => {
    fetchArchitectureResults(prReviewId);
  }, [prReviewId, fetchArchitectureResults]);

  return (
    <section className="rounded-lg border p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-muted-foreground">
          <Shield className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold">Architecture Review</h2>
        {!isLoading && results.length > 0 && (
          <span className="ml-1 text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
            {results.length}
          </span>
        )}
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          Loading architecture results…
        </p>
      )}

      {!isLoading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No architecture review results for this PR.
        </p>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-5">
          {results.map((file: ArchitectureFileResult) => (
            <div key={file.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs text-slate-600 bg-slate-50 border rounded px-2 py-1 break-all flex-1">
                  <a
                    href={`https://github.com/${repoName}/pull/${prNumber}/files`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {file.filename}
                  </a>
                </p>
                <ScoreBadge score={file.score} />
                {file.violationCount > 0 && (
                  <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                    {file.violationCount}{" "}
                    {file.violationCount === 1 ? "violation" : "violations"}
                  </span>
                )}
              </div>

              {file.violations.length > 0 && (
                <div className="space-y-2 pl-3 border-l-2 border-red-200">
                  {file.violations.map((v, i) => (
                    <div key={i} className="rounded border bg-white p-3 text-sm">
                      <p className="text-xs font-medium text-red-500 mb-1.5">
                        L{v.startLine}
                        {v.startLine !== v.endLine ? `–${v.endLine}` : ""}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {v.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {file.docReferences.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {file.docReferences.map((ref, i) =>
                    ref.documentId ? (
                      <Link
                        key={i}
                        href={`/repositories/${encodeURIComponent(repoName)}/architecture?doc=${ref.documentId}`}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        title={ref.excerpt}
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        {ref.name}
                      </Link>
                    ) : (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                        title={ref.excerpt}
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        {ref.name}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
