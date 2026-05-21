"use client";

import { FlaskConical } from "lucide-react";

export function BetaBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 px-4 py-3 mb-4 text-sm">
      <FlaskConical className="h-4 w-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
      <p className="text-blue-700 dark:text-blue-400">
        <span className="font-semibold text-blue-800 dark:text-blue-300">Think Throo is in Beta</span>
        {" — "}
        Some features are still evolving. Expect improvements and the occasional rough edge.
      </p>
    </div>
  );
}
