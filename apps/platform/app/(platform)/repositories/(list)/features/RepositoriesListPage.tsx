"use client";

import { useUmami } from "@/hooks/use-umami";
import { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { useRepositories } from "../hooks/useRepositories";
import NoRepoScreen from "../components/NoRepoScreen";
import DataTable from "../components/DataTable";
import { columns } from "../components/Columns";
import Header from "../components/Header";
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs";
import posthog from "posthog-js";
import * as Sentry from "@sentry/nextjs";

const RepositoriesListPage = memo(() => {
  const { repositories, isLoading, error, hasInstallations } =
    useRepositories();
  const [activeTab, setActiveTab] = useState<"accessible" | "revoked">(
    "accessible"
  );
  const { track } = useUmami();

  // Track page load and repository stats
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'repositories',
      message: 'Repositories list page loaded',
      level: 'info',
      data: {
        repositories_count: repositories.length,
        has_installations: hasInstallations,
      },
    });
    Sentry.logger.info(
      Sentry.logger.fmt`Repo page loaded: ${repositories.length} repos, installations: ${hasInstallations}`,
      {
        repositories_count: repositories.length,
        has_installations: hasInstallations,
        repo_names: repositories.map(r => r.name),
        timestamp: new Date().toISOString(),
      }
    );
  }, [repositories.length, hasInstallations, repositories]);

  // Separate repositories by access status
  const { accessibleRepos, revokedRepos } = useMemo(() => {
    const accessible = repositories.filter((repo) => repo.hasAccess);
    const revoked = repositories.filter((repo) => !repo.hasAccess);
    return { accessibleRepos: accessible, revokedRepos: revoked };
  }, [repositories]);

  const displayedRepos =
    activeTab === "accessible" ? accessibleRepos : revokedRepos;

  const handleTabChange = useCallback((value: string) => {
    const newTab = value as 'accessible' | 'revoked';
    setActiveTab(newTab);

    // PostHog: Track tab switch
    posthog.capture('repository_tab_switched', {
      from_tab: activeTab,
      to_tab: newTab,
      accessible_count: accessibleRepos.length,
      revoked_count: revokedRepos.length,
    });

    // Sentry: Track tab navigation
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'Repository tab switched',
      level: 'info',
      data: {
        from_tab: activeTab,
        to_tab: newTab,
        accessible_count: accessibleRepos.length,
        revoked_count: revokedRepos.length,
      },
    });
    Sentry.logger.info(
      Sentry.logger.fmt`Tab switched from ${activeTab} to ${newTab}`,
      {
        from_tab: activeTab,
        to_tab: newTab,
        accessible_count: accessibleRepos.length,
        revoked_count: revokedRepos.length,
        timestamp: new Date().toISOString(),
      }
    );
  }, [activeTab, accessibleRepos.length, revokedRepos.length]);

  if (isLoading) {
    return (
      <div className="p-6 w-full">
        <Header />
        <div className="text-muted-foreground">Loading repositories...</div>
      </div>
    );
  }

  if (!hasInstallations) {
    return <NoRepoScreen />;
  }

  if (error) {
    Sentry.captureException(error, {
      tags: {
        page: 'repositories_list',
        has_installations: hasInstallations,
      },
      contexts: {
        repositories: {
          repositories_count: repositories.length,
          error_message: error.message,
        },
      },
    });
    Sentry.logger.error(
      Sentry.logger.fmt`Failed to load repositories: ${error.message}`,
      {
        page: 'repositories_list',
        has_installations: hasInstallations,
        repositories_count: repositories.length,
        error_message: error.message,
        timestamp: new Date().toISOString(),
      }
    );
    return (
      <div className="p-6 w-full">
        <Header />
        <div className="text-red-600">
          Failed to load repositories: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <Header />
      <h2 className="font-normal font-inter text-black text-sm leading-5 mb-4">
        List of repositories accessible to Codearc.
      </h2>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as "accessible" | "revoked");
          track(
            value === "accessible"
              ? "repositories_tab_accessible"
              : "repositories_tab_revoked",
            { tab: value }
          );
        }}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="accessible">
            Accessible ({accessibleRepos.length})
          </TabsTrigger>
          <TabsTrigger value="revoked">
            Revoked ({revokedRepos.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-2">
        {displayedRepos.length === 0 ? (
          <div className="text-muted-foreground text-sm py-8 text-center">
            {activeTab === "accessible"
              ? "No accessible repositories found."
              : "No repositories with revoked access."}
          </div>
        ) : (
          <DataTable columns={columns} data={displayedRepos} />
        )}
      </div>
    </div>
  );
});

RepositoriesListPage.displayName = "RepositoriesListPage";

export default RepositoriesListPage;
