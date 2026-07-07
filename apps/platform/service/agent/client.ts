import { lambdaClient } from '@/lib/trpc/client/lambda';

export interface AgentItem {
  id: string;
  repositoryId: string;
  userId: string;
  runtimeId: string | null;
  name: string;
  description: string;
  instructions: string;
  model: string;
  visibility: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DaemonRuntimeItem {
  id: string;
  userId: string;
  name: string;
  status: string;
  lastSeenAt: Date | null;
  createdAt: Date;
}

export interface CreateAgentInput {
  repositoryFullName: string;
  name: string;
  description?: string;
  instructions?: string;
  model?: string;
  visibility?: 'personal' | 'workspace';
  runtimeId?: string;
}

export interface UpdateAgentInput {
  id: string;
  name?: string;
  description?: string;
  instructions?: string;
  model?: string;
  visibility?: 'personal' | 'workspace';
  status?: 'active' | 'paused' | 'archived';
  runtimeId?: string | null;
}

export class AgentClientService {
  getByRepository = async (repositoryFullName: string): Promise<AgentItem[]> => {
    return lambdaClient.agent.getByRepository.query({ repositoryFullName }) as Promise<AgentItem[]>;
  };

  getById = async (id: string): Promise<AgentItem> => {
    return lambdaClient.agent.getById.query({ id }) as Promise<AgentItem>;
  };

  create = async (input: CreateAgentInput): Promise<AgentItem> => {
    return lambdaClient.agent.create.mutate(input) as Promise<AgentItem>;
  };

  update = async (input: UpdateAgentInput): Promise<AgentItem> => {
    return lambdaClient.agent.update.mutate(input) as Promise<AgentItem>;
  };

  archive = async (id: string): Promise<AgentItem> => {
    return lambdaClient.agent.archive.mutate({ id }) as Promise<AgentItem>;
  };

  getMyRuntimes = async (): Promise<DaemonRuntimeItem[]> => {
    return lambdaClient.agent.getMyRuntimes.query() as Promise<DaemonRuntimeItem[]>;
  };

  deleteRuntime = async (id: string): Promise<DaemonRuntimeItem> => {
    return lambdaClient.agent.deleteRuntime.mutate({ id }) as Promise<DaemonRuntimeItem>;
  };
}

export const agentClientService = new AgentClientService();
