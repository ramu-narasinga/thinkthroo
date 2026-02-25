import { Shield } from "lucide-react";

/**
 * Thin banner displayed at the top of the www site to indicate
 * the Think Throo GitHub App is currently invite-only.
 */
export function InviteOnlyTopBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2 text-sm text-amber-800 dark:text-amber-300">
        <Shield className="h-4 w-4 shrink-0" />
        <span>
          <strong>Invite-Only Early Access</strong> — Think Throo GitHub App
          is currently invite-only.{" "}
          <a
            href="mailto:ramu@thinkthroo.com"
            className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
          >
            Email ramu@thinkthroo.com
          </a>{" "}
          to request access.
        </span>
      </div>
    </div>
  );
}
