import { AgentStoreState } from './initialState';

export const agentSelectors = {
  agents: (s: AgentStoreState) => s.agents,
  runtimes: (s: AgentStoreState) => s.runtimes,
  isLoading: (s: AgentStoreState) => s.isLoading,
  isFirstFetchFinished: (s: AgentStoreState) => s.isFirstFetchFinished,
};
