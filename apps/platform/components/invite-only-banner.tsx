"use client";

import { Shield } from "lucide-react";

/**
 * Banner shown across the platform to inform users that the
 * Think Throo GitHub App AI features are currently invite-only.
 */
export function InviteOnlyBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 mb-4 text-sm">
      <Shield className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="text-amber-700 dark:text-amber-400">
        <span className="font-semibold text-amber-800 dark:text-amber-300">Invite-Only Early Access</span>
        {" — "}
        Think Throo GitHub App AI features (PR reviews, architecture checks) are currently in <strong>invite-only</strong> mode.{" "}
        <a
          href="https://thinkthroo.com/request-access"
          className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
        >Request access here</a>.
      </p>
    </div>
  );
}
