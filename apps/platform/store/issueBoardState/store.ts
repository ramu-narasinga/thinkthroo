import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { IssueBoardStateStoreState, initialState } from './initialState';
import { IssueBoardStateAction, createIssueBoardStateSlice } from './slices/board/action';

export type IssueBoardStateStore = IssueBoardStateStoreState & IssueBoardStateAction;

const createStore: StateCreator<IssueBoardStateStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createIssueBoardStateSlice(...parameters),
});

const devtools = createDevtools('issueBoardState');

export const useIssueBoardStateStore = createWithEqualityFn<IssueBoardStateStore>()(
  devtools(createStore),
  shallow
);
