import { NextResponse } from "next/server"
import { getLearningDashboardStats } from "@/lib/learning-dashboard-stats"

/**
 * GET /api/dashboard/stats
 *
 * Returns total lesson counts (from Sanity) and first-lesson hrefs for every
 * module across all courses. The dashboard uses this to compute progress
 * percentages against real CMS data.
 */

export async function GET() {
  const courses = await getLearningDashboardStats()
  return NextResponse.json(courses)
}
