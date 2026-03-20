"use client";

import PrivatePageGuard from "@/components/private-page-guard";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

function handleAddToSlack() {
  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;

  if (!clientId) {
    toast.error("Slack integration is not configured yet.");
    return;
  }

  const redirectUri = `${window.location.origin}/api/integrations/slack/callback`;
  const scope = "incoming-webhook,chat:write";
  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", scope);
  url.searchParams.set("redirect_uri", redirectUri);

  window.location.href = url.toString();
}

export default function IntegrationsPage() {
  return (
    <PrivatePageGuard>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your tools and services to CodeArc.
          </p>
        </div>

        {/* Slack */}
        <div className="bg-muted rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-lg font-medium">Slack</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Add the CodeArc bot to your Slack workspace to get notified about
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
