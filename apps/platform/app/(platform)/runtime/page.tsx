"use client";

import { RuntimesCard } from "@/app/(platform)/repositories/[repository]/settings/components/RuntimesCard";

export default function RuntimePage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Runtime</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage local machines running the thinkthroo process.
        </p>
      </div>
      <RuntimesCard />
    </div>
  );
}
