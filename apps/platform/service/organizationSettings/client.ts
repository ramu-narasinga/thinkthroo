import { lambdaClient } from '@/lib/trpc/client/lambda';

export interface OrganizationSettingsInput {
  enableReviews?: boolean;
  enablePrSummary?: boolean;
  enableInlineReviewComments?: boolean;
  enableArchitectureReview?: boolean;
  reviewLanguage?: string | null;
  toneInstructions?: string | null;
  pathFilters?: string[];
  autoPauseAfterReviewedCommits?: number;
}

export class OrganizationSettingsClientService {
  getByOrganization = async (organizationId: string) => {
    return lambdaClient.organizationSettings.get.query({ organizationId });
  };

  upsert = async (organizationId: string, settings: OrganizationSettingsInput) => {
    return lambdaClient.organizationSettings.upsert.mutate({ organizationId, settings });
  };
}

export const organizationSettingsClientService = new OrganizationSettingsClientService();
