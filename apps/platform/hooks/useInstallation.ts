import { useState, useCallback } from 'react';
import { lambdaClient } from '@/lib/trpc/client/lambda';
import { useRouter } from 'next/navigation';

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

      try {
        const data = await lambdaClient.installation.processCallback.mutate({
          installationId,
          organizationId,
        });

        setResult(data);

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
      return installations;
    } catch (err) {
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
      return repositories;
    } catch (err) {
      console.error('[useInstallation] Error fetching repositories:', err);
      throw err;
    }
  }, []);

  /**
   * Delete installation
   */
  const deleteInstallation = useCallback(async (installationId: string) => {
    try {
      await lambdaClient.installation.deleteInstallation.mutate({
        installationId,
      });
    } catch (err) {
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
