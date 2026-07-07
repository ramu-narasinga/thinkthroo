import { lambdaClient } from '@/lib/trpc/client/lambda';

export type IssueCommentAuthorType = 'user' | 'agent';

export interface IssueCommentItem {
  id: string;
  repositoryId: string;
  issueNumber: number;
  userId: string;
  authorType: IssueCommentAuthorType;
  agentTaskId: string | null;
  body: string;
  createdAt: Date;
}

export class IssueCommentClientService {
  getByIssue = async (repositoryFullName: string, issueNumber: number): Promise<IssueCommentItem[]> => {
    return lambdaClient.issueComment.getByIssue.query({ repositoryFullName, issueNumber }) as Promise<IssueCommentItem[]>;
  };

  create = async (repositoryFullName: string, issueNumber: number, body: string): Promise<IssueCommentItem> => {
    return lambdaClient.issueComment.create.mutate({ repositoryFullName, issueNumber, body }) as Promise<IssueCommentItem>;
  };
}

export const issueCommentClientService = new IssueCommentClientService();
