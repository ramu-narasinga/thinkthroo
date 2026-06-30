import { lambdaClient } from '@/lib/trpc/client/lambda';

export type AgentTaskStatus =
  | 'queued'
  | 'dispatched'
  | 'waiting_local_directory'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AgentTaskResult {
  prUrl?: string;
  summary?: string;
  branchName?: string;
}

export interface AgentTaskItem {
  id: string;
  agentId: string;
  runtimeId: string | null;
  repositoryId: string;
  userId: string;
  issueNumber: number | null;
  issueTitle: string | null;
  issueBody: string | null;
  issueHtmlUrl: string | null;
  status: AgentTaskStatus;
  failureReason: string | null;
  result: string | null; // JSON-encoded AgentTaskResult
  waitReason: string | null;
  sessionId: string | null;
  workDir: string | null;
  attemptCount: number;
  userMessage: string | null;
  forceFreshSession: boolean;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface AgentTaskLogItem {
  id: string;
  taskId: string;
  userId: string;
  type: 'info' | 'output' | 'error';
  message: string;
  createdAt: Date;
}

export class AgentTaskClientService {
  getByRepository = async (repositoryFullName: string): Promise<AgentTaskItem[]> => {
    return lambdaClient.agentTask.getByRepository.query({ repositoryFullName }) as Promise<AgentTaskItem[]>;
  };

  getByIssue = async (repositoryFullName: string, issueNumber: number): Promise<AgentTaskItem[]> => {
    return lambdaClient.agentTask.getByIssue.query({ repositoryFullName, issueNumber }) as Promise<AgentTaskItem[]>;
  };

  getLogs = async (taskId: string): Promise<AgentTaskLogItem[]> => {
    return lambdaClient.agentTask.getLogs.query({ taskId }) as Promise<AgentTaskLogItem[]>;
  };

  cancel = async (id: string): Promise<AgentTaskItem> => {
    return lambdaClient.agentTask.cancel.mutate({ id }) as Promise<AgentTaskItem>;
  };
}

export const agentTaskClientService = new AgentTaskClientService();
