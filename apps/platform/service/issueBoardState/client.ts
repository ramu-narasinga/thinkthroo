import { lambdaClient } from '@/lib/trpc/client/lambda';

export type KanbanStatus = 'backlog' | 'planning' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked' | 'waiting_for_user';
export type Priority = 'no_priority' | 'urgent' | 'high' | 'medium' | 'low';
export type ExecutionMode = 'plan' | 'auto_accept_edits' | 'ask_before_edits' | 'auto';

export interface IssueAssigneeItem {
  id: string;
  assigneeType: 'agent' | 'member';
  assigneeAgentId: string | null;
  assigneeMemberId: string | null;
}

export interface IssueAttachmentItem {
  id: string;
  url: string;
  fileName: string;
  contentType: string | null;
}

export interface IssueLabelItem {
  id: string;
  repositoryId: string;
  name: string;
  color: string;
}

export interface AssignableMember {
  id: string;
  fullName: string;
  email: string;
}

export interface IssueBoardItem {
  id: string;
  repositoryId: string;
  userId: string;
  issueNumber: number;
  issueTitle: string;
  issueHtmlUrl: string | null;
  kanbanStatus: KanbanStatus;
  priority: Priority;
  executionMode: ExecutionMode;
  assigneeSquadId: string | null;
  assignees: IssueAssigneeItem[];
  labels: IssueLabelItem[];
  attachments: IssueAttachmentItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIssueInput {
  repositoryFullName: string;
  title: string;
  body?: string;
  priority?: Priority;
  kanbanStatus?: KanbanStatus;
  executionMode?: ExecutionMode;
  labelIds?: string[];
  assignees?: Array<{ assigneeType: 'agent' | 'member'; assigneeAgentId?: string; assigneeMemberId?: string }>;
  attachments?: Array<{ url: string; fileName: string; contentType?: string }>;
}

export class IssueBoardStateClientService {
  getByRepository = async (repositoryFullName: string): Promise<IssueBoardItem[]> => {
    return lambdaClient.issueBoardState.getByRepository.query({ repositoryFullName }) as Promise<IssueBoardItem[]>;
  };

  getAssignableMembers = async (repositoryFullName: string): Promise<AssignableMember[]> => {
    return lambdaClient.issueBoardState.getAssignableMembers.query({ repositoryFullName }) as Promise<AssignableMember[]>;
  };

  addToBoard = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    issueTitle: string;
    issueHtmlUrl?: string;
    priority?: Priority;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.addToBoard.mutate(input) as Promise<IssueBoardItem>;
  };

  updateKanbanStatus = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    kanbanStatus: KanbanStatus;
  }): Promise<{ boardState: IssueBoardItem; enqueuedTasks: unknown[] }> => {
    return lambdaClient.issueBoardState.updateKanbanStatus.mutate(input) as Promise<{
      boardState: IssueBoardItem;
      enqueuedTasks: unknown[];
    }>;
  };

  updatePriority = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    priority: Priority;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.updatePriority.mutate(input) as Promise<IssueBoardItem>;
  };

  updateExecutionMode = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    executionMode: ExecutionMode;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.updateExecutionMode.mutate(input) as Promise<IssueBoardItem>;
  };

  addAssignee = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    assigneeType: 'agent' | 'member';
    assigneeAgentId?: string;
    assigneeMemberId?: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.addAssignee.mutate(input) as Promise<IssueBoardItem>;
  };

  removeAssignee = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    assigneeId: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.removeAssignee.mutate(input) as Promise<IssueBoardItem>;
  };

  updateSquadAssignee = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    assigneeSquadId: string | null;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.updateSquadAssignee.mutate(input) as Promise<IssueBoardItem>;
  };

  addLabelToIssue = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    labelId: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.addLabelToIssue.mutate(input) as Promise<IssueBoardItem>;
  };

  removeLabelFromIssue = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    labelId: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.removeLabelFromIssue.mutate(input) as Promise<IssueBoardItem>;
  };

  addAttachment = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    url: string;
    fileName: string;
    contentType?: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.addAttachment.mutate(input) as Promise<IssueBoardItem>;
  };

  removeAttachment = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    attachmentId: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.removeAttachment.mutate(input) as Promise<IssueBoardItem>;
  };

  removeFromBoard = async (input: {
    repositoryFullName: string;
    issueNumber: number;
  }): Promise<{ success: boolean }> => {
    return lambdaClient.issueBoardState.removeFromBoard.mutate(input) as Promise<{ success: boolean }>;
  };

  deleteIssue = async (input: {
    repositoryFullName: string;
    issueNumber: number;
  }): Promise<{ success: boolean }> => {
    return lambdaClient.issueBoardState.deleteIssue.mutate(input) as Promise<{ success: boolean }>;
  };

  syncFromGitHub = async (repositoryFullName: string): Promise<{ synced: number }> => {
    return lambdaClient.issueBoardState.syncFromGitHub.mutate({ repositoryFullName }) as Promise<{ synced: number }>;
  };

  createIssue = async (input: CreateIssueInput): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.createIssue.mutate(input) as Promise<IssueBoardItem>;
  };
}

export const issueBoardStateClientService = new IssueBoardStateClientService();
