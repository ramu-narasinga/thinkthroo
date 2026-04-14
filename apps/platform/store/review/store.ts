import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { ReviewStoreState, initialState } from './initialState';
import { ReviewAction, createReviewSlice } from './slices/review/action';

export type ReviewStore = ReviewStoreState & ReviewAction;

const createStore: StateCreator<ReviewStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createReviewSlice(...parameters),
});

const devtools = createDevtools('review');

export const useReviewStore = createWithEqualityFn<ReviewStore>()(
  devtools(createStore),
  shallow
);

export const getReviewStoreState = () => useReviewStore.getState();
