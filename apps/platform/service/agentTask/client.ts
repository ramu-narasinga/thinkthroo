import { lambdaClient } from '@/lib/trpc/client/lambda';

export type AgentTaskStatus =
  | 'queued'
  | 'dispatched'
  | 'waiting_local_directory'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'waiting_for_user';

export type ExecutionMode = 'plan' | 'auto_accept_edits' | 'ask_before_edits' | 'auto';

export interface AgentTaskResult {
  prUrl?: string;
  summary?: string;
  branchName?: string;
  phase?: 'planning' | 'question';
  question?: string;
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
  taskType: 'implementation' | 'test' | 'review' | 'planning';
  executionMode: ExecutionMode;
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

export interface ArtifactItem {
  id: string;
  taskId: string;
  userId: string;
  type: 'screenshot' | 'video' | 'trace';
  url: string;
  filename: string;
  capturedAt: Date | null;
  createdAt: Date;
}

export interface AgentTaskLogItem {
  id: string;
  taskId: string;
  userId: string;
  type: 'info' | 'output' | 'error';
  message: string;
  createdAt: Date;
}

export interface AgentTaskEventItem {
  id: string;
  taskId: string;
  userId: string;
  eventType: 'agent_text' | 'tool_call' | 'tool_result' | 'error';
  toolName: string | null;
  toolUseId: string | null;
  toolInput: string | null;
  preview: string | null;
  raw: string | null;
  createdAt: Date;
}

export interface DiffFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
}

export interface DiffResult {
  branchName: string;
  prUrl: string | null;
  baseBranch: string;
  files: DiffFile[];
}

export interface ReviewComment {
  id: string;
  taskId: string;
  repositoryId: string;
  userId: string;
  issueNumber: number | null;
  filename: string;
  startLine: number;
  endLine: number | null;
  body: string;
  severity: 'error' | 'warning' | 'suggestion' | 'summary';
  authorType: 'agent' | 'user';
  parentCommentId: string | null;
  githubCommentId: number | null;
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

  getEvents = async (taskId: string): Promise<AgentTaskEventItem[]> => {
    return lambdaClient.agentTask.getEvents.query({ taskId }) as Promise<AgentTaskEventItem[]>;
  };

  cancel = async (id: string): Promise<AgentTaskItem> => {
    return lambdaClient.agentTask.cancel.mutate({ id }) as Promise<AgentTaskItem>;
  };

  getDiff = async (taskId: string): Promise<DiffResult> => {
    return lambdaClient.agentTask.getDiff.query({ taskId }) as Promise<DiffResult>;
  };

  createTestTask = async (repositoryFullName: string, issueNumber: number): Promise<AgentTaskItem> => {
    return lambdaClient.agentTask.createTestTask.mutate({ repositoryFullName, issueNumber }) as Promise<AgentTaskItem>;
  };

  getArtifacts = async (taskId: string): Promise<ArtifactItem[]> => {
    return lambdaClient.agentTask.getArtifacts.query({ taskId }) as Promise<ArtifactItem[]>;
  };

  createReviewTask = async (repositoryFullName: string, issueNumber: number): Promise<AgentTaskItem> => {
    return lambdaClient.agentTask.createReviewTask.mutate({ repositoryFullName, issueNumber }) as Promise<AgentTaskItem>;
  };

  getReviewComments = async (taskId: string): Promise<ReviewComment[]> => {
    return lambdaClient.agentTask.getReviewComments.query({ taskId }) as Promise<ReviewComment[]>;
  };

  addUserReviewComment = async (
    taskId: string,
    filename: string,
    startLine: number,
    body: string,
    replyToCommentId?: string
  ): Promise<ReviewComment> => {
    return lambdaClient.agentTask.addUserReviewComment.mutate({ taskId, filename, startLine, body, replyToCommentId }) as Promise<ReviewComment>;
  };
}

export const agentTaskClientService = new AgentTaskClientService();
