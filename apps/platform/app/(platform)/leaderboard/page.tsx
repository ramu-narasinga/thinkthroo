"use client";

import { Trophy, Medal, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import PrivatePageGuard from "@/components/private-page-guard";
import { Separator } from "@thinkthroo/ui/components/separator";
import { Card, CardContent } from "@thinkthroo/ui/components/card";
import { Badge } from "@thinkthroo/ui/components/badge";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "same";

type LeaderboardEntry = {
  rank: number;
  name: string;
  repository: string;
  score: number;
  reviews: number;
  violations: number;
  trend: Trend;
};

const ENTRIES: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "Alice Chen",
    repository: "platform",
    score: 980,
    reviews: 42,
    violations: 2,
    trend: "up",
  },
  {
    rank: 2,
    name: "Bob Martinez",
    repository: "github-app",
    score: 945,
    reviews: 38,
    violations: 4,
    trend: "same",
  },
  {
    rank: 3,
    name: "Carol Smith",
    repository: "www",
    score: 910,
    reviews: 35,
    violations: 5,
    trend: "up",
  },
  {
    rank: 4,
    name: "David Lee",
    repository: "platform",
    score: 870,
    reviews: 30,
    violations: 8,
    trend: "down",
  },
  {
    rank: 5,
    name: "Eva Patel",
    repository: "packages/ui",
    score: 820,
    reviews: 28,
    violations: 10,
    trend: "up",
  },
  {
    rank: 6,
    name: "Frank Nguyen",
    repository: "github-app",
    score: 790,
    reviews: 25,
    violations: 12,
    trend: "down",
  },
  {
    rank: 7,
    name: "Grace Kim",
    repository: "www",
    score: 750,
    reviews: 22,
    violations: 14,
    trend: "same",
  },
];

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up")
    return <ArrowUp className="h-4 w-4 text-green-600" />;
  if (trend === "down")
    return <ArrowDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-yellow-100 text-yellow-600 font-bold text-sm">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
        3
      </span>
    );
  return (
    <span className="flex items-center justify-center h-7 w-7 text-muted-foreground font-medium text-sm">
      {rank}
    </span>
  );
}

export default function LeaderboardPage() {
  const top = ENTRIES[0];

  return (
    <PrivatePageGuard>
      <div className="space-y-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-8 py-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h1 className="text-lg font-semibold">Leaderboard</h1>
        </div>
        <Separator />

        {/* Body */}
        <div className="px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Trophy className="h-8 w-8 text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Top Contributor</p>
                  <p className="text-base font-semibold">{top.name}</p>
                  <p className="text-xs text-muted-foreground">{top.repository}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <Medal className="h-8 w-8 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-base font-semibold">
                    {ENTRIES.reduce((sum, e) => sum + e.reviews, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">across all contributors</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <TrendingUp className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-base font-semibold">
                    {Math.round(
                      ENTRIES.reduce((sum, e) => sum + e.score, 0) / ENTRIES.length
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {/* Table header */}
              <div className="grid grid-cols-[48px_1fr_160px_80px_80px_80px_48px] items-center px-4 py-3 text-xs font-medium text-muted-foreground border-b">
                <span>#</span>
                <span>Contributor</span>
                <span>Repository</span>
                <span className="text-right">Score</span>
                <span className="text-right">Reviews</span>
                <span className="text-right">Violations</span>
                <span />
              </div>

              {ENTRIES.map((entry, idx) => (
                <div key={entry.rank}>
                  <div
                    className={cn(
                      "grid grid-cols-[48px_1fr_160px_80px_80px_80px_48px] items-center px-4 py-3",
                      entry.rank <= 3 && "bg-muted/40"
                    )}
                  >
                    <RankBadge rank={entry.rank} />

                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                        {entry.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm font-medium">{entry.name}</span>
                    </div>

                    <Badge variant="outline" className="w-fit text-xs font-normal">
                      {entry.repository}
                    </Badge>

                    <span className="text-sm font-semibold text-right">
                      {entry.score}
                    </span>

                    <span className="text-sm text-right text-muted-foreground">
                      {entry.reviews}
                    </span>

                    <span
                      className={cn(
                        "text-sm text-right",
                        entry.violations <= 5
                          ? "text-green-600"
                          : entry.violations <= 10
                          ? "text-yellow-600"
                          : "text-red-500"
                      )}
                    >
                      {entry.violations}
                    </span>

                    <div className="flex justify-end">
                      <TrendIcon trend={entry.trend} />
                    </div>
                  </div>
                  {idx < ENTRIES.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivatePageGuard>
  );
}
