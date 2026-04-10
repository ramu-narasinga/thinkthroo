import { lambdaClient } from '@/lib/trpc/client/lambda';
import { WeeklyMetric, FileHotspot, RuleHotspot } from '@/types/analytics';

export class AnalyticsClientService {
  getWeekly = async (
    organizationId: string,
    repositoryFullName?: string,
    weeks: number = 8,
  ): Promise<WeeklyMetric[]> => {
    return lambdaClient.analytics.getWeekly.query({
      organizationId,
      repositoryFullName,
      weeks,
    });
  };

  getHotspots = async (
    organizationId: string,
    repositoryFullName?: string,
    weeks: number = 8,
    limit: number = 10,
  ): Promise<{ files: FileHotspot[]; rules: RuleHotspot[] }> => {
    return lambdaClient.analytics.getHotspots.query({
      organizationId,
      repositoryFullName,
      weeks,
      limit,
    });
  };
}

export const analyticsClientService = new AnalyticsClientService();
