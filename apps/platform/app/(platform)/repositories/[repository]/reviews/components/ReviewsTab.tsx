"use client";

import React, { useState } from "react";
import { ArrowUpDown, ArrowDown, GitPullRequest, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@thinkthroo/ui/components/button";

type SortKey = "credits" | "date";
type SortDir = "asc" | "desc";

interface Review {
  id: string;
  repository: string;
  prNumber: number;
  prTitle: string;
  summaryPoints: string[];
  credits: number;
  date: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 183,
    prTitle: "skills library integrated",
    summaryPoints: [
      "New Way to Access Skills: Implemented a new feature that lets us fetch specific skill information by their unique names.",
      "Improvements to the Skills Page: We've made significant enhancements to our Skill Details Page. Now, it fetches skill details associated with a unique name and handles the task of presenting the information to the users.",
      "New User Interface Component: We've introduced a component called skill-page-client.tsx to properly display skill details, make statistical data visible, and make skill selection easier with sidebar navigation.",
      "Better Skill Selection Mechanism: We've integrated a sidebar for skill selection.",
    ],
    credits: 5968,
    date: "3 days ago",
  },
  {
    id: "2",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 179,
    prTitle: "add architecture validation pipeline",
    summaryPoints: [
      "Architecture Validation: Added a LangGraph-based pipeline to validate code changes against architecture rules.",
      "RAG Integration: Integrated retrieval-augmented generation to pull only relevant architecture docs.",
      "PR Bot Comments: The bot now posts focused feedback only on architecture violations.",
    ],
    credits: 4210,
    date: "5 days ago",
  },
  {
    id: "3",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 175,
    prTitle: "feat: add document editor panel",
    summaryPoints: [
      "Editor Panel: Added a full markdown editor panel for editing architecture documents inline.",
      "Auto-save: Documents are saved automatically after 500ms of inactivity.",
      "Keyboard Shortcuts: Added Cmd+S shortcut for manual save.",
    ],
    credits: 3102,
    date: "8 days ago",
  },
  {
    id: "4",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 170,
    prTitle: "feat: page 2 item 1",
    summaryPoints: [
      "Change me: This is placeholder content for page 2, item 1.",
      "Change me: Add your summary point here.",
    ],
    credits: 2800,
    date: "10 days ago",
  },
  {
    id: "5",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 165,
    prTitle: "feat: page 2 item 2",
    summaryPoints: [
      "Change me: This is placeholder content for page 2, item 2.",
      "Change me: Add your summary point here.",
    ],
    credits: 2500,
    date: "12 days ago",
  },
  {
    id: "6",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 160,
    prTitle: "feat: page 2 item 3",
    summaryPoints: [
      "Change me: This is placeholder content for page 2, item 3.",
      "Change me: Add your summary point here.",
    ],
    credits: 2200,
    date: "14 days ago",
  },
  {
    id: "7",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 155,
    prTitle: "feat: page 2 item 4",
    summaryPoints: [
      "Change me: This is placeholder content for page 2, item 4.",
      "Change me: Add your summary point here.",
    ],
    credits: 2000,
    date: "16 days ago",
  },
  {
    id: "8",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 150,
    prTitle: "feat: page 2 item 5",
    summaryPoints: [
      "Change me: This is placeholder content for page 2, item 5.",
      "Change me: Add your summary point here.",
    ],
    credits: 1800,
    date: "18 days ago",
  },
  {
    id: "9",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 145,
    prTitle: "feat: page 3 item 1",
    summaryPoints: [
      "Change me: This is placeholder content for page 3, item 1.",
      "Change me: Add your summary point here.",
    ],
    credits: 1600,
    date: "20 days ago",
  },
  {
    id: "10",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 140,
    prTitle: "feat: page 3 item 2",
    summaryPoints: [
      "Change me: This is placeholder content for page 3, item 2.",
      "Change me: Add your summary point here.",
    ],
    credits: 1400,
    date: "22 days ago",
  },
  {
    id: "11",
    repository: "ramu-narasinga/thinkthroo",
    prNumber: 135,
    prTitle: "feat: page 3 item 3",
    summaryPoints: [
      "Change me: This is placeholder content for page 3, item 3.",
      "Change me: Add your summary point here.",
    ],
    credits: 1200,
    date: "24 days ago",
  },
];

const PAGE_SIZE = 5;

export function ReviewsTab() {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const sorted = [...MOCK_REVIEWS].sort((a, b) => {
    if (sortKey === "credits") {
      return sortDir === "asc" ? a.credits - b.credits : b.credits - a.credits;
    }
    return sortDir === "asc"
      ? Number(a.id) - Number(b.id)
      : Number(b.id) - Number(a.id);
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

      {/* Rows */}
      <div className="divide-y">
        {paginated.map((review) => (
          <div key={review.id} className="flex gap-4 py-5">
            {/* Comment column */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-0.5">{review.repository}</p>
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
              {review.credits.toLocaleString()}
            </div>
            {/* Date */}
            <div className="w-28 text-right text-sm text-muted-foreground shrink-0 whitespace-nowrap">
              {review.date}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
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
    </div>
  );
}
