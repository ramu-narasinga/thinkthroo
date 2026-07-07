import { StateCreator } from 'zustand/vanilla';
import { AgentTaskStore } from '../../store';
import { AgentTaskItem } from '../../initialState';
import { agentTaskClientService } from '@/service/agentTask/client';

export interface AgentTaskAction {
  fetchTasks: (repositoryFullName: string) => Promise<void>;
  cancelTask: (id: string) => Promise<void>;
  upsertTask: (task: AgentTaskItem) => void;
}

export const createAgentTaskSlice: StateCreator<
  AgentTaskStore,
  [['zustand/devtools', never]],
  [],
  AgentTaskAction
> = (set) => ({
  fetchTasks: async (repositoryFullName) => {
    set({ isLoading: true }, false, 'fetchTasks/start');
    try {
      const tasks = await agentTaskClientService.getByRepository(repositoryFullName);
      set({ tasks, isFirstFetchFinished: true, isLoading: false }, false, 'fetchTasks/success');
    } catch (error) {
      console.error('[AgentTaskStore] Error fetching tasks:', error);
      set({ isLoading: false }, false, 'fetchTasks/error');
    }
  },

  cancelTask: async (id) => {
    const cancelled = await agentTaskClientService.cancel(id);
    set(
      (s) => ({ tasks: s.tasks.map((t) => (t.id === id ? cancelled : t)) }),
      false,
      'cancelTask'
    );
  },

  // Called by Supabase Realtime listener to push live updates
  upsertTask: (task) => {
    set(
      (s) => {
        const exists = s.tasks.some((t) => t.id === task.id);
        return {
          tasks: exists
            ? s.tasks.map((t) => (t.id === task.id ? task : t))
            : [task, ...s.tasks],
        };
      },
      false,
      'upsertTask'
    );
  },
});
