"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@thinkthroo/ui/components/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/analytics-ui/table";
import { analyticsClientService } from "@/service/analytics/client";
import type {
  AgentTaskSummary,
  AgentWeeklyActivity,
  AgentLeaderboardEntry,
  RepositoryBreakdownEntry,
} from "@/types/analytics";

const WEEK_OPTIONS = [
  { label: "4W", value: 4 },
  { label: "8W", value: 8 },
  { label: "12W", value: 12 },
  { label: "24W", value: 24 },
];

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(usd: number): string {
  if (usd === 0) return "$0.00";
  if (usd < 0.01) return "<$0.01";
  return `$${usd.toFixed(2)}`;
}

function KpiCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className="bg-muted rounded-xl p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold leading-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-muted rounded-xl p-5 flex flex-col gap-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-muted rounded-xl p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

function TableSkeleton({ cols = 6, rows = 4 }: { cols?: number; rows?: number }) {
  return (
    <div className="bg-muted rounded-xl p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="flex gap-3 mb-2">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-4 flex-1" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className="h-8 flex-1 rounded-lg" />)}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [weeks, setWeeks] = useState(8);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<AgentTaskSummary | null>(null);
  const [activity, setActivity] = useState<AgentWeeklyActivity[]>([]);
  const [leaderboard, setLeaderboard] = useState<AgentLeaderboardEntry[]>([]);
  const [repoBreakdown, setRepoBreakdown] = useState<RepositoryBreakdownEntry[]>([]);

  const fetchAll = useCallback(async (w: number) => {
    setLoading(true);
    try {
      const [s, a, l, r] = await Promise.all([
        analyticsClientService.getAgentSummary(w),
        analyticsClientService.getAgentActivityByWeek(w),
        analyticsClientService.getAgentLeaderboard(w),
        analyticsClientService.getRepositoryBreakdown(w),
      ]);
      setSummary(s);
      setActivity(a);
      setLeaderboard(l);
      setRepoBreakdown(r);
    } catch (err) {
      console.error("[Analytics] fetch error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(weeks);
  }, [weeks, fetchAll]);

  const totalTokens = summary
    ? summary.totalInputTokens + summary.totalOutputTokens + summary.totalCacheReadTokens + summary.totalCacheWriteTokens
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header + time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Agent productivity and cost insights</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {WEEK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWeeks(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                weeks === opt.value
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              title="Total Tasks"
              value={String(summary?.totalTasks ?? 0)}
              subtitle={`${summary?.completedTasks ?? 0} completed · ${summary?.failedTasks ?? 0} failed`}
            />
            <KpiCard
              title="PRs Created"
              value={String(summary?.prsCreated ?? 0)}
              subtitle="Tasks that produced a pull request"
            />
            <KpiCard
              title="Total Tokens"
              value={formatTokens(totalTokens)}
              subtitle={`${formatTokens(summary?.totalInputTokens ?? 0)} in · ${formatTokens(summary?.totalOutputTokens ?? 0)} out`}
            />
            <KpiCard
              title="Est. Cost"
              value={formatCost(summary?.estimatedCostUsd ?? 0)}
              subtitle="Based on Claude Sonnet 4.6 pricing"
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent Activity by Week */}
        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="bg-muted rounded-xl p-6">
            <h2 className="text-base font-semibold mb-1">Agent Activity</h2>
            <p className="text-xs text-muted-foreground mb-4">Completed tasks per week by type</p>
            <div className="h-[220px]">
              {activity.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="implementation" name="Impl" fill="#000000" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="test" name="Test" fill="#6b7280" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="review" name="Review" fill="#d1d5db" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* PR Velocity */}
        {loading ? (
          <SectionSkeleton />
        ) : (
          <div className="bg-muted rounded-xl p-6">
            <h2 className="text-base font-semibold mb-1">PR Velocity</h2>
            <p className="text-xs text-muted-foreground mb-4">Pull requests created per week</p>
            <div className="h-[220px]">
              {activity.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activity} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="prsCreated"
                      name="PRs"
                      stroke="#000000"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#fff", stroke: "#000000", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Agent Leaderboard */}
      {loading ? (
        <TableSkeleton cols={7} rows={4} />
      ) : (
        <div className="bg-muted rounded-xl p-6">
          <h2 className="text-base font-semibold mb-1">Agent Leaderboard</h2>
          <p className="text-xs text-muted-foreground mb-4">Ranked by tasks completed</p>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No agent tasks in this period</p>
          ) : (
            <Table className="border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>AGENT</TableHead>
                  <TableHead className="text-center">TASKS</TableHead>
                  <TableHead className="text-center">PRs</TableHead>
                  <TableHead className="text-center">SUCCESS %</TableHead>
                  <TableHead className="text-center">TOKENS</TableHead>
                  <TableHead className="text-center">EST. COST</TableHead>
                  <TableHead className="text-center">AVG TIME</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((row, idx) => (
                  <TableRow key={row.agentId} className="hover:bg-transparent">
                    <TableCell className="bg-white rounded-l-lg shadow-sm text-muted-foreground text-sm">{idx + 1}</TableCell>
                    <TableCell className="bg-white shadow-sm font-medium">{row.agentName}</TableCell>
                    <TableCell className="bg-white shadow-sm text-center">{row.tasksCompleted}</TableCell>
                    <TableCell className="bg-white shadow-sm text-center">{row.prsCreated}</TableCell>
                    <TableCell className="bg-white shadow-sm text-center">
                      <span className={row.successRate >= 80 ? "text-green-600 font-medium" : row.successRate >= 50 ? "text-yellow-600 font-medium" : "text-red-500 font-medium"}>
                        {row.successRate}%
                      </span>
                    </TableCell>
                    <TableCell className="bg-white shadow-sm text-center text-sm">{formatTokens(row.totalTokens)}</TableCell>
                    <TableCell className="bg-white shadow-sm text-center text-sm">{formatCost(row.estimatedCostUsd)}</TableCell>
                    <TableCell className="bg-white rounded-r-lg shadow-sm text-center text-sm text-muted-foreground">
                      {row.avgDurationMinutes > 0 ? `${row.avgDurationMinutes}m` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Repository Breakdown */}
      {loading ? (
        <TableSkeleton cols={5} rows={3} />
      ) : (
        <div className="bg-muted rounded-xl p-6">
          <h2 className="text-base font-semibold mb-1">Repository Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4">Activity and cost per repository</p>
          {repoBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No repository data in this period</p>
          ) : (
            <Table className="border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>REPOSITORY</TableHead>
                  <TableHead className="text-center">TASKS</TableHead>
                  <TableHead className="text-center">PRs</TableHead>
                  <TableHead className="text-center">TOKENS</TableHead>
                  <TableHead className="text-center">EST. COST</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repoBreakdown.map((row) => (
                  <TableRow key={row.repositoryId} className="hover:bg-transparent">
                    <TableCell className="bg-white rounded-l-lg shadow-sm font-medium">{row.repositoryName}</TableCell>
                    <TableCell className="bg-white shadow-sm text-center">{row.tasks}</TableCell>
                    <TableCell className="bg-white shadow-sm text-center">{row.prsCreated}</TableCell>
                    <TableCell className="bg-white shadow-sm text-center text-sm">{formatTokens(row.totalTokens)}</TableCell>
                    <TableCell className="bg-white rounded-r-lg shadow-sm text-center text-sm">{formatCost(row.estimatedCostUsd)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
