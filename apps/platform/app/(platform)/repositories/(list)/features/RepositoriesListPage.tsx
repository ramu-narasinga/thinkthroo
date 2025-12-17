'use client';

import { memo, useState, useMemo } from 'react';
import { useRepositories } from "../hooks/useRepositories";
import NoRepoScreen from "../components/NoRepoScreen";
import DataTable from "../components/DataTable";
import { columns } from "../components/Columns";
import Header from "../components/Header";
import { Tabs, TabsList, TabsTrigger } from "@thinkthroo/ui/components/tabs";

const RepositoriesListPage = memo(() => {
  const { repositories, isLoading, error, hasInstallations } = useRepositories();
  const [activeTab, setActiveTab] = useState<'accessible' | 'revoked'>('accessible');

  // Separate repositories by access status
  const { accessibleRepos, revokedRepos } = useMemo(() => {
    const accessible = repositories.filter(repo => repo.hasAccess);
    const revoked = repositories.filter(repo => !repo.hasAccess);
    return { accessibleRepos: accessible, revokedRepos: revoked };
  }, [repositories]);

  const displayedRepos = activeTab === 'accessible' ? accessibleRepos : revokedRepos;

  if (isLoading) {
    return (
      <div className="p-6 w-full">
        <Header />
        <div className="text-muted-foreground">
          Loading repositories...
        </div>
      </div>
    );
  }

  if (!hasInstallations) {
    return <NoRepoScreen />;
  }

  if (error) {
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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'accessible' | 'revoked')} className="mb-4">
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
            {activeTab === 'accessible' 
              ? 'No accessible repositories found.'
              : 'No repositories with revoked access.'}
          </div>
        ) : (
          <DataTable columns={columns} data={displayedRepos} />
        )}
      </div>
    </div>
  );
});

RepositoriesListPage.displayName = 'RepositoriesListPage';

export default RepositoriesListPage;
