import { AgentTaskItem } from '@/service/agentTask/client';

export type { AgentTaskItem };

export interface AgentTaskStoreState {
  tasks: AgentTaskItem[];
  isLoading: boolean;
  isFirstFetchFinished: boolean;
}

export const initialState: AgentTaskStoreState = {
  tasks: [],
  isLoading: false,
  isFirstFetchFinished: false,
};
