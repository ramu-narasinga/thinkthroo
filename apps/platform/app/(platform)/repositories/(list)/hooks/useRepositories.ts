import { useState, useEffect } from 'react';
import { lambdaClient } from '@/lib/trpc/client/lambda';

interface Repository {
  id: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string | null;
  private: boolean;
  installationId: string;
  organizationId: string;
  userId: string | null;
  hasAccess: boolean;
  lastSyncedAt: Date | null;
  removedAt: Date | null;
}

interface UseRepositoriesReturn {
  repositories: Repository[];
  isLoading: boolean;
  error: Error | null;
  hasInstallations: boolean;
  refetch: () => Promise<void>;
}

export function useRepositories(): UseRepositoriesReturn {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasInstallations, setHasInstallations] = useState(false);

  const fetchRepositories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const installations = await lambdaClient.installation.getAllInstallations.query();
      setHasInstallations(installations.length > 0);

      if (installations.length === 0) {
        setRepositories([]);
        return;
      }

      const repos = await lambdaClient.installation.getAllRepositories.query();
      setRepositories(repos);
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch repositories'));
      setRepositories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  return {
    repositories,
    isLoading,
    error,
    hasInstallations,
    refetch: fetchRepositories,
  };
}
