import DashboardAltPage from "@/components/DashboardAlt";
import { getLearningDashboardStats } from "@/lib/learning-dashboard-stats";

export default async function DashboardPage() {
  const courseStats = await getLearningDashboardStats();
  return <DashboardAltPage courseStats={courseStats} />;
}
