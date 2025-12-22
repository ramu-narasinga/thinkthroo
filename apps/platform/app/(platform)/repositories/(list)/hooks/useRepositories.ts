import { useState, useEffect } from 'react';
import { lambdaClient } from '@/lib/trpc/client/lambda';
import * as Sentry from '@sentry/nextjs';

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

      Sentry.addBreadcrumb({
        category: 'repositories',
        message: 'Fetching installations and repositories',
        level: 'info',
      });
      Sentry.logger.info(
        Sentry.logger.fmt`Fetching installations and repositories`,
        {
          timestamp: new Date().toISOString(),
        }
      );

      const installations = await lambdaClient.installation.getAllInstallations.query();
      setHasInstallations(installations.length > 0);

      if (installations.length === 0) {
        Sentry.addBreadcrumb({
          category: 'repositories',
          message: 'No installations found',
          level: 'info',
        });
        Sentry.logger.warn(
          Sentry.logger.fmt`No installations found for user`,
          {
            timestamp: new Date().toISOString(),
          }
        );
        setRepositories([]);
        return;
      }

      const repos = await lambdaClient.installation.getAllRepositories.query();
      setRepositories(repos);
      
      Sentry.addBreadcrumb({
        category: 'repositories',
        message: 'Repositories fetched successfully',
        level: 'info',
        data: {
          installations_count: installations.length,
          repositories_count: repos.length,
          accessible_count: repos.filter(r => r.hasAccess).length,
        },
      });
      Sentry.logger.info(
        Sentry.logger.fmt`Repositories fetched: ${repos.length} repos`,
        {
          installations_count: installations.length,
          repositories_count: repos.length,
          accessible_count: repos.filter(r => r.hasAccess).length,
          revoked_count: repos.filter(r => !r.hasAccess).length,
          repo_names: repos.map(r => r.name),
          timestamp: new Date().toISOString(),
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch repositories');
      Sentry.captureException(error, {
        tags: {
          hook: 'useRepositories',
          action: 'fetch',
        },
        level: 'error',
      });
      Sentry.logger.error(
        Sentry.logger.fmt`Failed to fetch repositories: ${error.message}`,
        {
          error: error.message,
          hook: 'useRepositories',
          action: 'fetch',
          timestamp: new Date().toISOString(),
        }
      );
      console.error('Failed to fetch repositories:', err);
      setError(error);
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
