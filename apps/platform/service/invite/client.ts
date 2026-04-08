import { lambdaClient } from '@/lib/trpc/client/lambda';

export class InviteClientService {
  getAll = async () => {
    return lambdaClient.invite.getAll.query();
  };

  sendInvite = async (params: { fullName: string; email: string }) => {
    return lambdaClient.invite.sendInvite.mutate(params);
  };
}

export const inviteClientService = new InviteClientService();
