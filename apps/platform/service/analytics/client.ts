import { lambdaClient } from '@/lib/trpc/client/lambda';
import {
  WeeklyMetric,
  FileHotspot,
  RuleHotspot,
  AgentTaskSummary,
  AgentWeeklyActivity,
  AgentLeaderboardEntry,
  RepositoryBreakdownEntry,
} from '@/types/analytics';

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

  getAgentSummary = async (weeks: number = 8): Promise<AgentTaskSummary> => {
    return lambdaClient.analytics.getAgentSummary.query({ weeks });
  };

  getAgentActivityByWeek = async (weeks: number = 8): Promise<AgentWeeklyActivity[]> => {
    return lambdaClient.analytics.getAgentActivityByWeek.query({ weeks });
  };

  getAgentLeaderboard = async (weeks: number = 8): Promise<AgentLeaderboardEntry[]> => {
    return lambdaClient.analytics.getAgentLeaderboard.query({ weeks });
  };

  getRepositoryBreakdown = async (weeks: number = 8): Promise<RepositoryBreakdownEntry[]> => {
    return lambdaClient.analytics.getRepositoryBreakdown.query({ weeks });
  };
}

export const analyticsClientService = new AnalyticsClientService();
