"use client";

import PrivatePageGuard from "@/components/private-page-guard";
import ProPlanGate from "@/components/pro-plan-gate";

export default function ProductionGradeProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivatePageGuard>
      <ProPlanGate>{children}</ProPlanGate>
    </PrivatePageGuard>
  );
}
