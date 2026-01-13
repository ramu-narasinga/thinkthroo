"use client";

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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyMetrics = [
  { week: "12/7", prsMerged: 1, humanReviews: 3, reviewCycles: 1.2, linesAdded: 120, linesDeleted: 30, medianLinesPR: 80 },
  { week: "12/14", prsMerged: 2, humanReviews: 5, reviewCycles: 1.5, linesAdded: 240, linesDeleted: 60, medianLinesPR: 110 },
  { week: "12/21", prsMerged: 1, humanReviews: 4, reviewCycles: 1.1, linesAdded: 180, linesDeleted: 40, medianLinesPR: 95 },
  { week: "12/28", prsMerged: 3, humanReviews: 6, reviewCycles: 1.8, linesAdded: 320, linesDeleted: 90, medianLinesPR: 130 },
  { week: "1/4", prsMerged: 2, humanReviews: 5, reviewCycles: 1.4, linesAdded: 260, linesDeleted: 70, medianLinesPR: 115 },
  { week: "1/11", prsMerged: 4, humanReviews: 7, reviewCycles: 2.0, linesAdded: 410, linesDeleted: 120, medianLinesPR: 150 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-6">
      {/* PRs merged graph */}
      <div className="bg-muted rounded-xl p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Pull Requests</h2>
          <p className="text-sm text-muted-foreground">PRs merged per week</p>
        </div>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyMetrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="prsMerged"
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

      {/* Analytics table */}
      <div className="bg-muted rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6">Weekly Metrics</h2>

        <Table className="border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow>
              <TableHead>WEEK ↑</TableHead>
              <TableHead className="text-center">PRS MERGED</TableHead>
              <TableHead className="text-center">HUMAN REVIEWS</TableHead>
              <TableHead className="text-center">REVIEW CYCLES</TableHead>
              <TableHead className="text-center">LINES ADDED</TableHead>
              <TableHead className="text-center">LINES DELETED</TableHead>
              <TableHead className="text-center">MEDIAN LINES/PR</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {weeklyMetrics.map((row) => (
              <TableRow key={row.week} className="hover:bg-transparent">
                <TableCell className="bg-white rounded-l-lg shadow-sm font-medium">{row.week}</TableCell>
                <TableCell className="bg-white shadow-sm text-center">{row.prsMerged}</TableCell>
                <TableCell className="bg-white shadow-sm text-center">{row.humanReviews}</TableCell>
                <TableCell className="bg-white shadow-sm text-center">{row.reviewCycles.toFixed(1)}</TableCell>
                <TableCell className="bg-white shadow-sm text-center">{row.linesAdded}</TableCell>
                <TableCell className="bg-white shadow-sm text-center">{row.linesDeleted}</TableCell>
                <TableCell className="bg-white rounded-r-lg shadow-sm text-center">{row.medianLinesPR}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
