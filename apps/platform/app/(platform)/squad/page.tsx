"use client";

import { Users2 } from "lucide-react";

export default function SquadPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Squad</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your team and collaborators.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <Users2 className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Squad features coming soon.</p>
      </div>
    </div>
  );
}
