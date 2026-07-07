import { lambdaClient } from '@/lib/trpc/client/lambda';

export type KanbanStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export interface IssueBoardItem {
  id: string;
  repositoryId: string;
  userId: string;
  issueNumber: number;
  issueTitle: string;
  issueHtmlUrl: string | null;
  kanbanStatus: KanbanStatus;
  assigneeType: 'agent' | 'member' | 'squad' | null;
  assigneeAgentId: string | null;
  assigneeMemberId: string | null;
  assigneeSquadId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class IssueBoardStateClientService {
  getByRepository = async (repositoryFullName: string): Promise<IssueBoardItem[]> => {
    return lambdaClient.issueBoardState.getByRepository.query({ repositoryFullName }) as Promise<IssueBoardItem[]>;
  };

  addToBoard = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    issueTitle: string;
    issueHtmlUrl?: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.addToBoard.mutate(input) as Promise<IssueBoardItem>;
  };

  updateKanbanStatus = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    kanbanStatus: KanbanStatus;
  }): Promise<{ boardState: IssueBoardItem; enqueuedTask: unknown | null }> => {
    return lambdaClient.issueBoardState.updateKanbanStatus.mutate(input) as Promise<{
      boardState: IssueBoardItem;
      enqueuedTask: unknown | null;
    }>;
  };

  updateAssignee = async (input: {
    repositoryFullName: string;
    issueNumber: number;
    assigneeType: 'agent' | 'member' | 'squad' | null;
    assigneeAgentId?: string | null;
    assigneeMemberId?: string | null;
    assigneeSquadId?: string | null;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.updateAssignee.mutate(input) as Promise<IssueBoardItem>;
  };

  removeFromBoard = async (input: {
    repositoryFullName: string;
    issueNumber: number;
  }): Promise<{ success: boolean }> => {
    return lambdaClient.issueBoardState.removeFromBoard.mutate(input) as Promise<{ success: boolean }>;
  };

  syncFromGitHub = async (repositoryFullName: string): Promise<{ synced: number }> => {
    return lambdaClient.issueBoardState.syncFromGitHub.mutate({ repositoryFullName }) as Promise<{ synced: number }>;
  };

  createIssue = async (input: {
    repositoryFullName: string;
    title: string;
    body?: string;
  }): Promise<IssueBoardItem> => {
    return lambdaClient.issueBoardState.createIssue.mutate(input) as Promise<IssueBoardItem>;
  };
}

export const issueBoardStateClientService = new IssueBoardStateClientService();
