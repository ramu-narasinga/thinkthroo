import fs from 'node:fs/promises';
import { DaemonConfig } from './config.js';

type ProgressType = 'info' | 'output' | 'error';

interface TaskResult {
  prUrl?: string;
  summary?: string;
  branchName?: string;
  phase?: 'planning' | 'question';
  question?: string;
}

export interface StructuredEventInput {
  eventType: 'agent_text' | 'tool_call' | 'tool_result' | 'error';
  toolName?: string;
  toolUseId?: string;
  toolInput?: string;
  preview?: string;
  raw: string;
}

const VERCEL_PROTECTION_BYPASS = process.env.VERCEL_PROTECTION_BYPASS ?? '';

function headers(config: DaemonConfig): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    'x-vercel-protection-bypass': VERCEL_PROTECTION_BYPASS,
  };
}

async function post(url: string, body: unknown, config: DaemonConfig): Promise<Response> {
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(config),
    body: JSON.stringify(body),
  });
  return res;
}

async function get(url: string, config: DaemonConfig): Promise<Response> {
  const res = await fetch(url, {
    method: 'GET',
    headers: headers(config),
  });
  return res;
}

export async function heartbeat(config: DaemonConfig): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/heartbeat`, {}, config);
}

export async function deregister(config: DaemonConfig): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/deregister`, {}, config).catch(() => {});
}

export async function claimTask(config: DaemonConfig): Promise<ClaimedTask | null> {
  const res = await post(
    `${config.platformUrl}/api/daemon/runtimes/${config.runtimeId}/tasks/claim`,
    {},
    config
  );
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(`Claim failed: ${err.error ?? res.status}`);
  }
  return res.json() as Promise<ClaimedTask>;
}

export async function startTask(taskId: string, config: DaemonConfig): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/tasks/${taskId}/start`, {}, config);
}

export async function reportProgress(
  taskId: string,
  message: string,
  type: ProgressType,
  config: DaemonConfig
): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/tasks/${taskId}/progress`, { message, type }, config).catch(() => {});
}

export async function reportStructuredEvent(
  taskId: string,
  event: StructuredEventInput,
  config: DaemonConfig
): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/tasks/${taskId}/events`, event, config).catch(() => {});
}

export async function reportComment(
  taskId: string,
  body: string,
  config: DaemonConfig
): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/tasks/${taskId}/comment`, { body }, config);
}

export async function fetchIssueComments(
  taskId: string,
  config: DaemonConfig
): Promise<Array<{ authorType: string; body: string; createdAt: string }>> {
  const res = await get(`${config.platformUrl}/api/daemon/tasks/${taskId}/comments`, config);
  if (!res.ok) return [];
  const data = await res.json() as { comments?: Array<{ authorType: string; body: string; createdAt: string }> };
  return data.comments ?? [];
}

export async function pinSession(
  taskId: string,
  sessionId: string,
  workDir: string,
  config: DaemonConfig
): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/tasks/${taskId}/session`, { sessionId, workDir }, config);
}

export async function completeTask(
  taskId: string,
  result: TaskResult,
  config: DaemonConfig
): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/tasks/${taskId}/complete`, { result }, config);
}

export async function failTask(
  taskId: string,
  reason: string,
  config: DaemonConfig,
  message?: string
): Promise<void> {
  await post(`${config.platformUrl}/api/daemon/tasks/${taskId}/fail`, { reason, message }, config);
}

export async function reportUsage(
  taskId: string,
  inputTokens: number,
  outputTokens: number,
  model: string,
  config: DaemonConfig,
  cacheReadTokens = 0,
  cacheWriteTokens = 0
): Promise<void> {
  await post(
    `${config.platformUrl}/api/daemon/tasks/${taskId}/usage`,
    { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, model },
    config
  ).catch(() => {});
}

// Type returned by the claim endpoint
export interface ClaimedTask {
  task: {
    id: string;
    agentId: string;
    runtimeId: string;
    repositoryId: string;
    issueNumber: number | null;
    issueTitle: string | null;
    issueBody: string | null;
    issueHtmlUrl: string | null;
    sessionId: string | null;
    workDir: string | null;
    attemptCount: number;
    userMessage: string | null;
    taskType: string;
    executionMode: string;
    context: string | null;
  };
  agent: {
    instructions: string;
    model: string;
    skills: Array<{ name: string; slug: string; content: string }>;
  } | null;
  repository: {
    htmlUrl: string;
    installationId: string;
    fullName: string;
  } | null;
  githubToken: string | null;
}

export interface ReviewCommentInput {
  filename: string;
  startLine: number;
  endLine?: number;
  body: string;
  severity: string;
}

export async function postReviewComments(
  taskId: string,
  summary: string,
  comments: ReviewCommentInput[],
  config: DaemonConfig
): Promise<void> {
  await post(
    `${config.platformUrl}/api/daemon/tasks/${taskId}/review-comments`,
    { summary, comments },
    config
  ).catch(() => {});
}

export async function uploadArtifact(
  taskId: string,
  type: 'screenshot' | 'video' | 'trace',
  filename: string,
  filePath: string,
  config: DaemonConfig
): Promise<void> {
  const data = await fs.readFile(filePath);
  const base64Data = data.toString('base64');
  await post(
    `${config.platformUrl}/api/daemon/tasks/${taskId}/artifacts`,
    { type, filename, base64Data, capturedAt: new Date().toISOString() },
    config
  ).catch(() => {});
}
