import { useState, useCallback } from 'react';
import { lambdaClient } from '@/lib/trpc/client/lambda';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

export interface InstallationResult {
  installationId: string;
  githubOrgId: string;
  repoCount: number;
}

export const useInstallation = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstallationResult | null>(null);

  /**
   * Process GitHub installation callback
   * Syncs installation and repositories to database
   */
  const processInstallation = useCallback(
    async (installationId: string, organizationId: string) => {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      Sentry.addBreadcrumb({
        category: 'installation',
        message: 'Processing GitHub installation',
        level: 'info',
        data: { installationId, organizationId },
      });

      try {
        const data = await lambdaClient.installation.processCallback.mutate({
          installationId,
          organizationId,
        });

        setResult(data);

        Sentry.addBreadcrumb({
          category: 'installation',
          message: 'Installation processed successfully',
          level: 'info',
          data: {
            installationId: data.installationId,
            repoCount: data.repoCount,
          },
        });

        // Redirect to repositories page after successful installation
        setTimeout(() => {
          router.push('/repositories');
        }, 2000);

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to process installation. Please try again.';
        setError(errorMessage);
        
        Sentry.captureException(err, {
          tags: {
            hook: 'useInstallation',
            action: 'processCallback',
          },
          contexts: {
            installation: {
              installation_id: installationId,
              organization_id: organizationId,
              error_message: errorMessage,
            },
          },
        });
        
        console.error('[useInstallation] Error processing installation:', err);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [router]
  );

  /**
   * Get all installations for current user
   */
  const fetchInstallations = useCallback(async () => {
    try {
      const installations =
        await lambdaClient.installation.getAllInstallations.query();
      
      Sentry.addBreadcrumb({
        category: 'installation',
        message: 'Fetched installations',
        level: 'info',
        data: { count: installations.length },
      });
      
      return installations;
    } catch (err) {
      Sentry.captureException(err, {
        tags: {
          hook: 'useInstallation',
          action: 'fetchInstallations',
        },
      });
      console.error('[useInstallation] Error fetching installations:', err);
      throw err;
    }
  }, []);

  /**
   * Get all repositories for current user
   */
  const fetchRepositories = useCallback(async () => {
    try {
      const repositories =
        await lambdaClient.installation.getAllRepositories.query();
      
      Sentry.addBreadcrumb({
        category: 'installation',
        message: 'Fetched repositories',
        level: 'info',
        data: { count: repositories.length },
      });
      
      return repositories;
    } catch (err) {
      Sentry.captureException(err, {
        tags: {
          hook: 'useInstallation',
          action: 'fetchRepositories',
        },
      });
      console.error('[useInstallation] Error fetching repositories:', err);
      throw err;
    }
  }, []);

  /**
   * Delete installation
   */
  const deleteInstallation = useCallback(async (installationId: string) => {
    Sentry.addBreadcrumb({
      category: 'installation',
      message: 'Deleting installation',
      level: 'info',
      data: { installationId },
    });
    
    try {
      await lambdaClient.installation.deleteInstallation.mutate({
        installationId,
      });
      
      Sentry.captureMessage('Installation deleted', {
        level: 'info',
        tags: {
          hook: 'useInstallation',
          action: 'delete',
        },
        contexts: {
          installation: {
            installation_id: installationId,
          },
        },
      });
    } catch (err) {
      Sentry.captureException(err, {
        tags: {
          hook: 'useInstallation',
          action: 'deleteInstallation',
        },
        contexts: {
          installation: {
            installation_id: installationId,
          },
        },
      });
      console.error('[useInstallation] Error deleting installation:', err);
      throw err;
    }
  }, []);

  /**
   * Reset error and result states
   */
  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    // State
    isProcessing,
    error,
    result,

    // Actions
    processInstallation,
    fetchInstallations,
    fetchRepositories,
    deleteInstallation,
    reset,
  };
};
