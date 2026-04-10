"use client";

import { useEffect } from "react";
import PrivatePageGuard from "@/components/private-page-guard";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/analytics-ui/table";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAnalyticsStore } from "@/store/analytics/store";
import { useOrganizationStore } from "@/store/organization";
import { organizationSelectors } from "@/store/organization/selectors";
import { Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
  const weeklyMetrics = useAnalyticsStore((s) => s.weeklyMetrics);
  const hotspotFiles = useAnalyticsStore((s) => s.hotspotFiles);
  const topViolatedRules = useAnalyticsStore((s) => s.topViolatedRules);
  const isWeeklyLoading = useAnalyticsStore((s) => s.isWeeklyLoading);
  const isHotspotsLoading = useAnalyticsStore((s) => s.isHotspotsLoading);
  const isFirstFetchFinished = useAnalyticsStore((s) => s.isFirstFetchFinished);
  const fetchAll = useAnalyticsStore((s) => s.fetchAll);

  useEffect(() => {
    if (activeOrg?.id) {
      fetchAll(activeOrg.id);
    }
  }, [activeOrg?.id, fetchAll]);

  const isLoading = isWeeklyLoading || isHotspotsLoading;
  const isEmpty = isFirstFetchFinished && weeklyMetrics.length === 0;

  // Summary stats
  const totalPrs = weeklyMetrics.reduce((sum, m) => sum + m.prsReviewed, 0);
  const totalViolations = weeklyMetrics.reduce((sum, m) => sum + m.totalViolations, 0);
  const avgScore =
    weeklyMetrics.length > 0
      ? (weeklyMetrics.reduce((sum, m) => sum + m.avgComplianceScore, 0) / weeklyMetrics.length).toFixed(1)
      : "—";
  const overallCleanRate =
    totalPrs > 0
      ? Math.round(
          (weeklyMetrics.reduce((sum, m) => sum + m.cleanPrs, 0) / totalPrs) * 100
        )
      : null;

  return (
    <PrivatePageGuard>
      <div className="p-8 space-y-6">
        {/* Loading state */}
        {!isFirstFetchFinished && isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="bg-muted rounded-xl p-12 text-center">
            <h2 className="text-lg font-semibold mb-2">No analytics data yet</h2>
            <p className="text-sm text-muted-foreground">
              Analytics will appear here once the CodeArc bot reviews PRs in your repositories.
            </p>
          </div>
        )}

        {/* Dashboard content */}
        {isFirstFetchFinished && weeklyMetrics.length > 0 && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">PRs Reviewed</p>
                <p className="text-2xl font-semibold">{totalPrs}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Total Violations</p>
                <p className="text-2xl font-semibold">{totalViolations}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Avg Compliance Score</p>
                <p className="text-2xl font-semibold">{avgScore}</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Clean PR Rate</p>
                <p className="text-2xl font-semibold">
                  {overallCleanRate !== null ? `${overallCleanRate}%` : "—"}
                </p>
              </div>
            </div>

            {/* Compliance score trend */}
            <div className="bg-muted rounded-xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Compliance Score Trend</h2>
                <p className="text-sm text-muted-foreground">
                  Average architecture compliance score per week
                </p>
              </div>

              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyMetrics}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avgComplianceScore"
                      name="Compliance Score"
                      stroke="#000000"
                      strokeWidth={2}
                      dot={{
                        r: 4,
                        fill: "#fff",
                        stroke: "#000000",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Violation trend */}
            <div className="bg-muted rounded-xl p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Violation Trend</h2>
                <p className="text-sm text-muted-foreground">
                  Total architecture violations per week
                </p>
              </div>

              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyMetrics}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar
                      dataKey="totalViolations"
                      name="Violations"
                      fill="#000000"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly metrics table */}
            <div className="bg-muted rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6">Weekly Metrics</h2>

              <Table className="border-separate border-spacing-y-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>WEEK ↑</TableHead>
                    <TableHead className="text-center">PRS REVIEWED</TableHead>
                    <TableHead className="text-center">VIOLATIONS</TableHead>
                    <TableHead className="text-center">AVG SCORE</TableHead>
                    <TableHead className="text-center">CLEAN PRS</TableHead>
                    <TableHead className="text-center">CLEAN PR RATE</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {weeklyMetrics.map((row) => (
                    <TableRow key={row.week} className="hover:bg-transparent">
                      <TableCell className="bg-white rounded-l-lg shadow-sm font-medium">
                        {row.week}
                      </TableCell>
                      <TableCell className="bg-white shadow-sm text-center">
                        {row.prsReviewed}
                      </TableCell>
                      <TableCell className="bg-white shadow-sm text-center">
                        {row.totalViolations}
                      </TableCell>
                      <TableCell className="bg-white shadow-sm text-center">
                        {row.avgComplianceScore}
                      </TableCell>
                      <TableCell className="bg-white shadow-sm text-center">
                        {row.cleanPrs}
                      </TableCell>
                      <TableCell className="bg-white rounded-r-lg shadow-sm text-center">
                        {row.cleanPrRate}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Hotspot files */}
            {hotspotFiles.length > 0 && (
              <div className="bg-muted rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-2">Violation Hotspots</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Files with the most architecture violations
                </p>

                <Table className="border-separate border-spacing-y-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>FILE</TableHead>
                      <TableHead className="text-center">VIOLATIONS</TableHead>
                      <TableHead className="text-center">AVG SCORE</TableHead>
                      <TableHead className="text-center">PRS AFFECTED</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {hotspotFiles.map((file) => (
                      <TableRow
                        key={file.filename}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="bg-white rounded-l-lg shadow-sm font-mono text-sm">
                          {file.filename}
                        </TableCell>
                        <TableCell className="bg-white shadow-sm text-center">
                          {file.totalViolations}
                        </TableCell>
                        <TableCell className="bg-white shadow-sm text-center">
                          {file.avgScore}
                        </TableCell>
                        <TableCell className="bg-white rounded-r-lg shadow-sm text-center">
                          {file.prCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Top violated rules */}
            {topViolatedRules.length > 0 && (
              <div className="bg-muted rounded-xl p-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Most Violated Architecture Rules
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Architecture docs that are most frequently violated
                </p>

                <Table className="border-separate border-spacing-y-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>RULE</TableHead>
                      <TableHead className="text-center">VIOLATIONS</TableHead>
                      <TableHead className="text-center">PRS AFFECTED</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {topViolatedRules.map((rule) => (
                      <TableRow
                        key={rule.ruleName}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="bg-white rounded-l-lg shadow-sm font-medium">
                          {rule.ruleName}
                        </TableCell>
                        <TableCell className="bg-white shadow-sm text-center">
                          {rule.violationCount}
                        </TableCell>
                        <TableCell className="bg-white rounded-r-lg shadow-sm text-center">
                          {rule.prCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </PrivatePageGuard>
  );
}
