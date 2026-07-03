export interface WeeklyMetric {
  week: string;
  weekStart: string;
  prsReviewed: number;
  totalViolations: number;
  avgComplianceScore: number;
  cleanPrs: number;
  cleanPrRate: number;
}

export interface FileHotspot {
  filename: string;
  totalViolations: number;
  avgScore: number;
  prCount: number;
}

export interface RuleHotspot {
  ruleName: string;
  violationCount: number;
  prCount: number;
}

export interface AnalyticsData {
  weeklyMetrics: WeeklyMetric[];
  hotspotFiles: FileHotspot[];
  topViolatedRules: RuleHotspot[];
}

// Agent analytics types
export interface AgentTaskSummary {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  prsCreated: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  estimatedCostUsd: number;
}

export interface AgentWeeklyActivity {
  week: string;
  weekStart: string;
  implementation: number;
  test: number;
  review: number;
  prsCreated: number;
}

export interface AgentLeaderboardEntry {
  agentId: string;
  agentName: string;
  tasksCompleted: number;
  prsCreated: number;
  successRate: number;
  totalTokens: number;
  estimatedCostUsd: number;
  avgDurationMinutes: number;
}

export interface RepositoryBreakdownEntry {
  repositoryId: string;
  repositoryName: string;
  tasks: number;
  prsCreated: number;
  totalTokens: number;
  estimatedCostUsd: number;
}
