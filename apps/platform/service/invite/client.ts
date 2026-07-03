import { lambdaClient } from '@/lib/trpc/client/lambda';

export class InviteClientService {
  getAll = async (organizationId: string) => {
    return lambdaClient.invite.getAll.query({ organizationId });
  };

  sendInvite = async (params: { fullName: string; email: string; organizationId: string }) => {
    return lambdaClient.invite.sendInvite.mutate(params);
  };
}

export const inviteClientService = new InviteClientService();
