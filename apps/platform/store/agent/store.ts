import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { AgentStoreState, initialState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agent/action';

export type AgentStore = AgentStoreState & AgentAction;

const createStore: StateCreator<AgentStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createAgentSlice(...parameters),
});

const devtools = createDevtools('agent');

export const useAgentStore = createWithEqualityFn<AgentStore>()(
  devtools(createStore),
  shallow
);

export const getAgentStoreState = () => useAgentStore.getState();
