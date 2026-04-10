import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { AnalyticsStoreState, initialState } from './initialState';
import { AnalyticsAction, createAnalyticsSlice } from './slices/analytics/action';

export type AnalyticsStore = AnalyticsStoreState & AnalyticsAction;

const createStore: StateCreator<AnalyticsStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createAnalyticsSlice(...parameters),
});

const devtools = createDevtools('analytics');

export const useAnalyticsStore = createWithEqualityFn<AnalyticsStore>()(
  devtools(createStore),
  shallow,
);

export const getAnalyticsStoreState = () => useAnalyticsStore.getState();
