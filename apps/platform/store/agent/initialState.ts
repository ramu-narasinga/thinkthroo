import { AgentItem, DaemonRuntimeItem } from '@/service/agent/client';

export type { AgentItem, DaemonRuntimeItem };

export interface AgentStoreState {
  agents: AgentItem[];
  runtimes: DaemonRuntimeItem[];
  isLoading: boolean;
  isFirstFetchFinished: boolean;
}

export const initialState: AgentStoreState = {
  agents: [],
  runtimes: [],
  isLoading: false,
  isFirstFetchFinished: false,
};
