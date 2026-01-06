"use client"

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@thinkthroo/ui/components/table";

const weeklyMetrics = [
  { week: "11/30/2025", prsMerged: 0, humanReviews: 0, reviewCycles: 0.0, linesAdded: 0, linesDeleted: 0, medianLinesPR: 0 },
  { week: "12/7/2025", prsMerged: 0, humanReviews: 0, reviewCycles: 0.0, linesAdded: 0, linesDeleted: 0, medianLinesPR: 0 },
  { week: "12/14/2025", prsMerged: 0, humanReviews: 0, reviewCycles: 0.0, linesAdded: 0, linesDeleted: 0, medianLinesPR: 0 },
  { week: "12/21/2025", prsMerged: 0, humanReviews: 0, reviewCycles: 0.0, linesAdded: 0, linesDeleted: 0, medianLinesPR: 0 },
  { week: "12/28/2025", prsMerged: 0, humanReviews: 0, reviewCycles: 0.0, linesAdded: 0, linesDeleted: 0, medianLinesPR: 0 },
  { week: "1/4/2026", prsMerged: 0, humanReviews: 0, reviewCycles: 0.0, linesAdded: 0, linesDeleted: 0, medianLinesPR: 0 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="bg-muted rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6">Weekly Metrics</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>WEEK ↑</TableHead>
              <TableHead>PRS MERGED</TableHead>
              <TableHead>HUMAN REVIEWS</TableHead>
              <TableHead>REVIEW CYCLES</TableHead>
              <TableHead>LINES ADDED</TableHead>
              <TableHead>LINES DELETED</TableHead>
              <TableHead>MEDIAN LINES/PR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeklyMetrics.map((row) => (
              <TableRow key={row.week}>
                <TableCell>{row.week}</TableCell>
                <TableCell>{row.prsMerged}</TableCell>
                <TableCell>{row.humanReviews}</TableCell>
                <TableCell>{row.reviewCycles.toFixed(1)}</TableCell>
                <TableCell>{row.linesAdded}</TableCell>
                <TableCell>{row.linesDeleted}</TableCell>
                <TableCell>{row.medianLinesPR}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
