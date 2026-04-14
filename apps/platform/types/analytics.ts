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
