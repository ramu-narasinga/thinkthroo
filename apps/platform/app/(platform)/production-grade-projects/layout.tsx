"use client";

import PrivatePageGuard from "@/components/private-page-guard";

export default function ProductionGradeProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivatePageGuard>{children}</PrivatePageGuard>;
}
