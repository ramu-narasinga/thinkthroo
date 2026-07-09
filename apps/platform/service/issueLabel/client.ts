import { lambdaClient } from '@/lib/trpc/client/lambda';
import { IssueLabelItem } from '@/service/issueBoardState/client';

export class IssueLabelClientService {
  getByRepository = async (repositoryFullName: string): Promise<IssueLabelItem[]> => {
    return lambdaClient.issueLabel.getByRepository.query({ repositoryFullName }) as Promise<IssueLabelItem[]>;
  };

  create = async (input: { repositoryFullName: string; name: string; color: string }): Promise<IssueLabelItem> => {
    return lambdaClient.issueLabel.create.mutate(input) as Promise<IssueLabelItem>;
  };

  delete = async (input: { repositoryFullName: string; labelId: string }): Promise<{ success: boolean }> => {
    return lambdaClient.issueLabel.delete.mutate(input) as Promise<{ success: boolean }>;
  };
}

export const issueLabelClientService = new IssueLabelClientService();
