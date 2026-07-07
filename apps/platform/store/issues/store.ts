import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { IssueStoreState, initialState } from './initialState';
import { IssueAction, createIssueSlice } from './slices/issues/action';

export type IssueStore = IssueStoreState & IssueAction;

const createStore: StateCreator<IssueStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createIssueSlice(...parameters),
});

const devtools = createDevtools('issues');

export const useIssueStore = createWithEqualityFn<IssueStore>()(
  devtools(createStore),
  shallow
);

export const getIssueStoreState = () => useIssueStore.getState();
