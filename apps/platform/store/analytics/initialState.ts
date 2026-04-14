import { WeeklyMetric, FileHotspot, RuleHotspot } from '@/types/analytics';

export interface AnalyticsStoreState {
  weeklyMetrics: WeeklyMetric[];
  hotspotFiles: FileHotspot[];
  topViolatedRules: RuleHotspot[];
  isWeeklyLoading: boolean;
  isHotspotsLoading: boolean;
  isFirstFetchFinished: boolean;
}

export const initialState: AnalyticsStoreState = {
  weeklyMetrics: [],
  hotspotFiles: [],
  topViolatedRules: [],
  isWeeklyLoading: false,
  isHotspotsLoading: false,
  isFirstFetchFinished: false,
};
