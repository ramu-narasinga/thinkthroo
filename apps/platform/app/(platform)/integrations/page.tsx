"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PrivatePageGuard from "@/components/private-page-guard";
import { toast } from "sonner";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import { useOrganizationStore } from "@/store/organization";
import { organizationSelectors } from "@/store/organization/selectors";
import { lambdaClient } from "@/lib/trpc/client/lambda";

interface SlackIntegration {
  id: string;
  teamName: string;
  channelName: string;
  notifyPrReviews: boolean;
  notifyArchitectureViolations: boolean;
  isActive: boolean;
}

function IntegrationsContent() {
  const searchParams = useSearchParams();
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
  const [slackIntegration, setSlackIntegration] =
    useState<SlackIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchIntegration = useCallback(async () => {
    if (!activeOrg?.id) return;
    setIsLoading(true);
    try {
      const result = await lambdaClient.slack.getIntegration.query({
        organizationId: activeOrg.id,
      });
      setSlackIntegration(result as SlackIntegration | null);
    } catch {
      setSlackIntegration(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrg?.id]);

  useEffect(() => {
    fetchIntegration();
  }, [fetchIntegration]);

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      toast.success("Slack connected successfully!");
      fetchIntegration();
    }
    const error = searchParams.get("error");
    if (error) {
      toast.error(`Slack connection failed: ${error}`);
    }
  }, [searchParams, fetchIntegration]);

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

  async function handleToggle(
    field: "notifyPrReviews" | "notifyArchitectureViolations",
    value: boolean,
  ) {
    if (!activeOrg?.id) return;
    try {
      await lambdaClient.slack.updateNotificationSettings.mutate({
        organizationId: activeOrg.id,
        [field]: value,
      });
      setSlackIntegration((prev) =>
        prev ? { ...prev, [field]: value } : prev,
      );
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
    }
  }

  async function handleDisconnect() {
    if (!activeOrg?.id) return;
    setIsDisconnecting(true);
    try {
      await lambdaClient.slack.disconnect.mutate({
        organizationId: activeOrg.id,
      });
      setSlackIntegration(null);
      toast.success("Slack disconnected");
    } catch {
      toast.error("Failed to disconnect Slack");
    } finally {
      setIsDisconnecting(false);
    }
  }

  const isConnected = slackIntegration?.isActive;

  return (
    <PrivatePageGuard>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your tools and services to Think Throo.
          </p>
        </div>

        {/* Slack */}
        <div className="bg-muted rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-lg font-medium">Slack</h2>
            </div>
            {isConnected && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                <Check className="h-3 w-3" />
                Connected
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Add the Think Throo bot to your Slack workspace to get notified about
            architecture validation results and pull request reviews.
          </p>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              {/* Connection info */}
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Workspace:</span>{" "}
                  <span className="font-medium">
                    {slackIntegration.teamName}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Channel:</span>{" "}
                  <span className="font-medium">
                    #{slackIntegration.channelName}
                  </span>
                </p>
              </div>

              {/* Notification toggles */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Notifications</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm">PR Review summaries</span>
                  <input
                    type="checkbox"
                    checked={slackIntegration.notifyPrReviews}
                    onChange={(e) =>
                      handleToggle("notifyPrReviews", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Architecture violations</span>
                  <input
                    type="checkbox"
                    checked={slackIntegration.notifyArchitectureViolations}
                    onChange={(e) =>
                      handleToggle(
                        "notifyArchitectureViolations",
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToSlack}
                  className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                >
                  Reconnect
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-background px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {isDisconnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Disconnect
                </button>
              </div>
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

export default function IntegrationsPage() {
  return (
    <Suspense>
      <IntegrationsContent />
    </Suspense>
  );
}
