"use client";

import { useEffect, useState } from "react";
import PrivatePageGuard from "@/components/private-page-guard";
import { toast } from "sonner";
import { Skeleton } from "@thinkthroo/ui/components/skeleton";
import { useOrganizationStore } from "@/store/organization";
import { organizationSelectors } from "@/store/organization/selectors";
import { lambdaClient } from "@/lib/trpc/client/lambda";

interface SlackIntegration {
  id: string;
  teamName: string;
  channelName: string;
  isActive: boolean;
}

export default function SlackIntegrationPage() {
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
  const isOrgReady = useOrganizationStore(organizationSelectors.isFirstFetchFinished);
  const [slackIntegration, setSlackIntegration] = useState<SlackIntegration | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!isOrgReady) return;
    if (!activeOrg?.id) {
      setShowSkeleton(false);
      return;
    }
    let cancelled = false;
    lambdaClient.slack.getIntegration
      .query({ organizationId: activeOrg.id })
      .then((result) => {
        if (!cancelled) {
          setSlackIntegration(result as SlackIntegration | null);
          setShowSkeleton(false);
        }
      })
      .catch(() => {
        if (!cancelled) setShowSkeleton(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOrgReady, activeOrg?.id]);

  function handleAddToSlack() {
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    if (!clientId) {
      toast.error("Slack integration is not configured yet.");
      return;
    }
    if (!activeOrg?.id) {
      toast.error("Please select an organization first.");
      return;
    }
    const scope = "incoming-webhook,chat:write";
    const url = new URL("https://slack.com/oauth/v2/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("scope", scope);
    url.searchParams.set("state", activeOrg.id);
    window.location.href = url.toString();
  }

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

          {showSkeleton ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          ) : slackIntegration?.isActive ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Workspace:</span>{" "}
                <span className="font-medium">{slackIntegration.teamName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Channel:</span>{" "}
                <span className="font-medium">#{slackIntegration.channelName}</span>
              </p>
            </div>
          ) : (
            <button
              onClick={handleAddToSlack}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 hover:scale-[1.02] transition-all"
            >
              Add to Slack
            </button>
          )}
        </div>
      </div>
    </PrivatePageGuard>
  );
}
