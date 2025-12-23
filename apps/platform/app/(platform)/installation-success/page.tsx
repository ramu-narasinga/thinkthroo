"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useInstallation } from "@/hooks/useInstallation";
import { useOrganizationStore } from "@/store/organization";
import { organizationSelectors } from "@/store/organization/selectors";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@thinkthroo/ui/components/alert";
import { Button } from "@thinkthroo/ui/components/button";
import Link from "next/link";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";

function InstallationSuccessContent() {
  const searchParams = useSearchParams();
  const { processInstallation, isProcessing, error, result } = useInstallation();

  // Get active organization from store
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);

  // Use refs to track if we've already captured events to prevent duplicates
  const hasTrackedSuccess = useRef(false);
  const hasTrackedError = useRef(false);

  useEffect(() => {
    const installationId = searchParams.get("installation_id");

    Sentry.addBreadcrumb({
      category: "installation",
      message: "Installation success page loaded",
      level: "info",
      data: {
        installation_id: installationId,
        organization_id: activeOrg?.id,
        has_active_org: !!activeOrg,
      },
    });

    // Use active organization ID from store
    if (installationId && activeOrg?.id) {
      Sentry.setContext("installation", {
        installation_id: installationId,
        organization_id: activeOrg.id,
      });
      processInstallation(installationId, activeOrg.id);
    } else if (!activeOrg?.id) {
      Sentry.captureMessage("Installation success: Missing active organization", {
        level: "warning",
        tags: {
          page: "installation_success",
        },
        contexts: {
          installation: {
            installation_id: installationId,
            has_org: !!activeOrg,
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrg?.id]); // Re-run if active org changes

  // Loading state
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-500" />
          <h1 className="text-2xl font-semibold">Processing Installation...</h1>
          <p className="text-gray-600">
            Setting up CodeArc and syncing your repositories
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    // PostHog: Track installation failed (only once)
    if (!hasTrackedError.current) {
      hasTrackedError.current = true;
      posthog.capture('github_app_installation_failed', {
        error_message: error,
        installation_id: searchParams.get("installation_id"),
        organization_id: activeOrg?.id,
      });
      posthog.captureException(new Error(`GitHub App installation failed: ${error}`));
      
      // Sentry: Capture installation failure with detailed context
      Sentry.captureException(new Error(`GitHub App installation failed: ${error}`), {
        tags: {
          flow: "installation",
          status: "failed",
        },
        contexts: {
          installation: {
            installation_id: searchParams.get("installation_id"),
            organization_id: activeOrg?.id,
            error_message: error,
          },
        },
      });
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Installation Failed</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/repositories">Go to Repositories</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Success state
  if (result) {
    // PostHog: Track installation completed (only once)
    if (!hasTrackedSuccess.current) {
      hasTrackedSuccess.current = true;
      posthog.capture('github_app_installation_completed', {
        installation_id: result.installationId,
        github_org_id: result.githubOrgId,
        repository_count: result.repoCount,
        organization_id: activeOrg?.id,
      });
      
      // Sentry: Track successful installation with metrics
      Sentry.captureMessage("GitHub App installation completed successfully", {
        level: "info",
        tags: {
          flow: "installation",
          status: "success",
        },
        contexts: {
          installation: {
            installation_id: result.installationId,
            github_org_id: result.githubOrgId,
            repository_count: result.repoCount,
            organization_id: activeOrg?.id,
          },
        },
      });
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Installation Successful!</h1>
            <p className="text-gray-600">
              CodeArc has been installed on{" "}
              <span className="font-semibold">{result.githubOrgId}</span>
            </p>
          </div>

          <Alert className="text-left">
            <AlertTitle>What&apos;s next?</AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              <p>✅ Synced {result.repoCount} repositories</p>
              <p>✅ Installation ID: {result.installationId}</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to your repositories...
              </p>
            </AlertDescription>
          </Alert>

          <Button asChild className="w-full">
            <Link href="/repositories">Go to Repositories Now</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Missing parameters
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Invalid Installation</AlertTitle>
        <AlertDescription>
          Missing installation parameters. Please try installing CodeArc again.
        </AlertDescription>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/repositories">Go to Repositories</Link>
        </Button>
      </Alert>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <InstallationSuccessContent />
    </Suspense>
  );
}
