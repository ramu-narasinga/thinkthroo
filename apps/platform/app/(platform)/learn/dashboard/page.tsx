"use client";
import DashboardAltPage from "@/components/DashboardAlt";
import PrivatePageGuard from "@/components/private-page-guard";

export default function LearnDashboardPage() {
  return (
    <PrivatePageGuard>
      <DashboardAltPage />
    </PrivatePageGuard>
  );
}
