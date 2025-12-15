'use client';

import { memo } from 'react';
import { useRepositories } from "../hooks/useRepositories";
import NoRepoScreen from "../components/NoRepoScreen";
import DataTable from "../components/DataTable";
import { columns } from "../components/Columns";
import Header from "../components/Header";

const RepositoriesListPage = memo(() => {
  const { repositories, isLoading, error, hasInstallations } = useRepositories();

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
      <h2 className="font-normal font-inter text-black text-sm leading-5 mb-8">
        List of repositories accessible to Codearc.
      </h2>
      <div className="mt-2">
        <DataTable columns={columns} data={repositories} />
      </div>
    </div>
  );
});

RepositoriesListPage.displayName = 'RepositoriesListPage';

export default RepositoriesListPage;
