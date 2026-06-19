// Dashboard course metadata — module/lesson counts come from Sanity via getLearningDashboardStats()
export interface DashboardCourse {
  id: string;
  title: string;
  slug: string;
  path: string;
  /** Matches courseSlug in getLearningDashboardStats() */
  courseSlug: string;
}

export const dashboardCourses: DashboardCourse[] = [
  {
    id: "1",
    title: "Codebase Architecture",
    slug: "codebase-architecture",
    path: "/architecture",
    courseSlug: "architecture",
  },
  {
    id: "2",
    title: "Production Grade Projects",
    slug: "production-grade-projects",
    path: "/production-grade-projects",
    courseSlug: "production-grade-projects",
  },
];
