"use client";

import PrivatePageGuard from "@/components/private-page-guard";

export default function DashboardPage() {
  return (
    <PrivatePageGuard>
      <div className="p-8 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-muted rounded-xl p-6 h-32" />
          <div className="bg-muted rounded-xl p-6 h-32" />
          <div className="bg-muted rounded-xl p-6 h-32" />
        </div>
        <div className="bg-muted rounded-xl p-6 h-48" />
        <div className="bg-muted rounded-xl p-6 h-48" />
      </div>
    </PrivatePageGuard>
  );
}

