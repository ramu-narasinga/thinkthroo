import { StateCreator } from 'zustand/vanilla';
import { AnalyticsStore } from '../../store';
import { analyticsClientService } from '@/service/analytics';

export interface AnalyticsAction {
  fetchWeeklyMetrics: (organizationId: string, repositoryFullName?: string, weeks?: number) => Promise<void>;
  fetchHotspots: (organizationId: string, repositoryFullName?: string, weeks?: number) => Promise<void>;
  fetchAll: (organizationId: string, repositoryFullName?: string, weeks?: number) => Promise<void>;
}

export const createAnalyticsSlice: StateCreator<
  AnalyticsStore,
  [['zustand/devtools', never]],
  [],
  AnalyticsAction
> = (set, get) => ({
  fetchWeeklyMetrics: async (organizationId, repositoryFullName, weeks = 8) => {
    set({ isWeeklyLoading: true }, false, 'fetchWeeklyMetrics/start');
    try {
      const weeklyMetrics = await analyticsClientService.getWeekly(
        organizationId,
        repositoryFullName,
        weeks,
      );
      set(
        { weeklyMetrics, isWeeklyLoading: false, isFirstFetchFinished: true },
        false,
        'fetchWeeklyMetrics/success',
      );
    } catch (error) {
      console.error('[AnalyticsStore] Error fetching weekly metrics:', error);
      set({ isWeeklyLoading: false }, false, 'fetchWeeklyMetrics/error');
    }
  },

  fetchHotspots: async (organizationId, repositoryFullName, weeks = 8) => {
    set({ isHotspotsLoading: true }, false, 'fetchHotspots/start');
    try {
      const { files, rules } = await analyticsClientService.getHotspots(
        organizationId,
        repositoryFullName,
        weeks,
      );
      set(
        { hotspotFiles: files, topViolatedRules: rules, isHotspotsLoading: false },
        false,
        'fetchHotspots/success',
      );
    } catch (error) {
      console.error('[AnalyticsStore] Error fetching hotspots:', error);
      set({ isHotspotsLoading: false }, false, 'fetchHotspots/error');
    }
  },

  fetchAll: async (organizationId, repositoryFullName, weeks = 8) => {
    await Promise.all([
      get().fetchWeeklyMetrics(organizationId, repositoryFullName, weeks),
      get().fetchHotspots(organizationId, repositoryFullName, weeks),
    ]);
  },
});
