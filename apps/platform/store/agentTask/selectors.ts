import { AgentTaskStoreState } from './initialState';

export const agentTaskSelectors = {
  tasks: (s: AgentTaskStoreState) => s.tasks,
  isLoading: (s: AgentTaskStoreState) => s.isLoading,
  isFirstFetchFinished: (s: AgentTaskStoreState) => s.isFirstFetchFinished,
};
