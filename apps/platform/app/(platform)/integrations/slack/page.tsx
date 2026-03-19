"use client";

import PrivatePageGuard from "@/components/private-page-guard";

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
            Add the CodeArc bot to your Slack workspace to get notified about
            architecture validation results and pull request reviews.
          </p>
          <button className="inline-flex items-center gap-2 rounded-md bg-[#4A154B] px-4 py-2 text-sm font-medium text-white hover:bg-[#3e1040] transition-colors">
            Add to Slack
          </button>
        </div>
      </div>
    </PrivatePageGuard>
  );
}
