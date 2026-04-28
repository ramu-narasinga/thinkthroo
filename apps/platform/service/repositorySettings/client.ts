import { lambdaClient } from '@/lib/trpc/client/lambda';

export interface RepositorySettingsInput {
  useOrganizationSettings?: boolean;
  enableReviews?: boolean;
  enablePrSummary?: boolean;
  enableInlineReviewComments?: boolean;
  enableArchitectureReview?: boolean;
  reviewLanguage?: string | null;
  toneInstructions?: string | null;
  pathFilters?: string[];
  autoPauseAfterReviewedCommits?: number;
}

export class RepositorySettingsClientService {
  getByFullName = async (repositoryFullName: string) => {
    return lambdaClient.repositorySettings.get.query({ repositoryFullName });
  };

  upsert = async (
    repositoryId: string,
    organizationId: string,
    settings: RepositorySettingsInput,
  ) => {
    return lambdaClient.repositorySettings.upsert.mutate({
      repositoryId,
      organizationId,
      settings,
    });
  };
}

export const repositorySettingsClientService = new RepositorySettingsClientService();
