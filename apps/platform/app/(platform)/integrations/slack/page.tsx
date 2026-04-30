"use client";

import PrivatePageGuard from "@/components/private-page-guard";
import { toast } from "sonner";

function handleAddToSlack() {
  // Redirects through the server-side initiate route which generates
  // a CSRF token, stores it in a cookie, then redirects to Slack.
  // orgId is not available on this standalone page — user should use
  // the main /integrations page where an org is already selected.
  window.location.href = "/integrations";
}

export default function SlackIntegrationPage() {
  return (
    <PrivatePageGuard>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Slack Integration</h1>
          <p className="text-muted-foreground mt-1">
            Connect your Slack workspace to receive notifications and updates.
          </p>
        </div>
        <div className="bg-muted rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium">Connect Slack</h2>
          <p className="text-sm text-muted-foreground">
            Add the ThinkThroo bot to your Slack workspace to get notified about
            architecture validation results and pull request reviews.
          </p>
          <button
            onClick={handleAddToSlack}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 hover:scale-[1.02] transition-all"
          >
            Add to Slack
          </button>
        </div>
      </div>
    </PrivatePageGuard>
  );
}
