import { lambdaClient } from '@/lib/trpc/client/lambda';

export interface IssueLabel {
  name: string;
  color: string;
}

export interface IssueItem {
  id: number;
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  author: string;
  authorAvatarUrl: string;
  labels: IssueLabel[];
  createdAt: string;
  updatedAt: string;
}

export class IssueClientService {
  getByRepository = async (
    repositoryFullName: string,
    page: number,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<{ issues: IssueItem[]; hasMore: boolean }> => {
    return lambdaClient.issues.getByRepository.query({
      repositoryFullName,
      page,
      perPage: 25,
      state,
    });
  };
}

export const issueClientService = new IssueClientService();
