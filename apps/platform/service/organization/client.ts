import { lambdaClient } from '@/lib/trpc/client/lambda';
import { OrganizationItem } from '@/store/organization/initialState';

/**
 * Client-side organization service
 * Wraps tRPC/lambda client calls for use in stores and components
 */
export class OrganizationClientService {
  /**
   * Get all organizations for the current user from database
   */
  getAll = async (): Promise<OrganizationItem[]> => {
    const result = await lambdaClient.organization.getAll.query();
    
    // Map null to undefined to match OrganizationItem type
    return result.map((org) => ({
      id: org.id,
      githubOrgId: org.githubOrgId,
      login: org.login ?? undefined,
      avatarUrl: org.avatarUrl ?? undefined,
      description: org.description ?? undefined,
      apiUrl: org.apiUrl ?? undefined,
      reposUrl: org.reposUrl ?? undefined,
      lastFetched: org.lastFetched ?? undefined,
    }));
  };

  /**
   * Sync organizations from GitHub to database
   */
  syncFromGitHub = async (accessToken: string): Promise<void> => {
    await lambdaClient.organization.syncFromGitHub.mutate({
      accessToken,
    });
  };

  /**
   * Get organization by ID
   */
  getById = async (id: string) => {
    return lambdaClient.organization.getById.query({ id });
  };

  /**
   * Get organization by GitHub org ID
   */
  getByGithubOrgId = async (githubOrgId: string) => {
    return lambdaClient.organization.getByGithubOrgId.query({ githubOrgId });
  };

  /**
   * Delete organization
   */
  delete = async (id: string) => {
    return lambdaClient.organization.delete.mutate({ id });
  };
}

export const organizationClientService = new OrganizationClientService();
