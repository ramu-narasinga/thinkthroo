import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { AgentTaskStoreState, initialState } from './initialState';
import { AgentTaskAction, createAgentTaskSlice } from './slices/agentTask/action';

export type AgentTaskStore = AgentTaskStoreState & AgentTaskAction;

const createStore: StateCreator<AgentTaskStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createAgentTaskSlice(...parameters),
});

const devtools = createDevtools('agentTask');

export const useAgentTaskStore = createWithEqualityFn<AgentTaskStore>()(
  devtools(createStore),
  shallow
);

export const getAgentTaskStoreState = () => useAgentTaskStore.getState();
