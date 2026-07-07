import { StateCreator } from 'zustand/vanilla';
import { AgentStore } from '../../store';
import { AgentItem } from '../../initialState';
import { agentClientService, CreateAgentInput, UpdateAgentInput } from '@/service/agent/client';

export interface AgentAction {
  fetchAgents: (repositoryFullName: string) => Promise<void>;
  fetchRuntimes: () => Promise<void>;
  createAgent: (input: CreateAgentInput) => Promise<AgentItem>;
  updateAgent: (input: UpdateAgentInput) => Promise<AgentItem>;
  archiveAgent: (id: string) => Promise<void>;
  deleteRuntime: (id: string) => Promise<void>;
}

export const createAgentSlice: StateCreator<
  AgentStore,
  [['zustand/devtools', never]],
  [],
  AgentAction
> = (set, get) => ({
  fetchAgents: async (repositoryFullName) => {
    set({ isLoading: true }, false, 'fetchAgents/start');
    try {
      const agents = await agentClientService.getByRepository(repositoryFullName);
      set({ agents, isFirstFetchFinished: true, isLoading: false }, false, 'fetchAgents/success');
    } catch (error) {
      console.error('[AgentStore] Error fetching agents:', error);
      set({ isLoading: false }, false, 'fetchAgents/error');
    }
  },

  fetchRuntimes: async () => {
    try {
      const runtimes = await agentClientService.getMyRuntimes();
      set({ runtimes }, false, 'fetchRuntimes/success');
    } catch (error) {
      console.error('[AgentStore] Error fetching runtimes:', error);
    }
  },

  createAgent: async (input) => {
    const agent = await agentClientService.create(input);
    set((s) => ({ agents: [agent, ...s.agents] }), false, 'createAgent');
    return agent;
  },

  updateAgent: async (input) => {
    const updated = await agentClientService.update(input);
    set(
      (s) => ({ agents: s.agents.map((a) => (a.id === updated.id ? updated : a)) }),
      false,
      'updateAgent'
    );
    return updated;
  },

  archiveAgent: async (id) => {
    const archived = await agentClientService.archive(id);
    set(
      (s) => ({ agents: s.agents.map((a) => (a.id === id ? archived : a)) }),
      false,
      'archiveAgent'
    );
  },

  deleteRuntime: async (id) => {
    await agentClientService.deleteRuntime(id);
    set(
      (s) => ({ runtimes: s.runtimes.filter((r) => r.id !== id) }),
      false,
      'deleteRuntime'
    );
  },
});
