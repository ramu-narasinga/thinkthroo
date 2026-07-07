import { lambdaClient } from '@/lib/trpc/client/lambda';

export interface SquadItem {
  id: string;
  repositoryId: string;
  userId: string;
  name: string;
  description: string;
  leaderAgentId: string | null;
  leaderName: string | null;
  repositoryFullName: string | null;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SquadMemberItem {
  squadId: string;
  memberType: string;
  agentId: string | null;
  memberId: string | null;
  role: string | null;
  agentName: string | null;
}

export interface SquadWithMembers {
  id: string;
  repositoryId: string;
  userId: string;
  name: string;
  description: string;
  leaderAgentId: string | null;
  leaderName: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: SquadMemberItem[];
}

export class SquadClientService {
  getAll = async (): Promise<SquadItem[]> => {
    return lambdaClient.squad.getAll.query() as Promise<SquadItem[]>;
  };

  getByRepository = async (repositoryFullName: string): Promise<SquadWithMembers[]> => {
    return lambdaClient.squad.getByRepository.query({ repositoryFullName }) as Promise<SquadWithMembers[]>;
  };

  create = async (input: {
    repositoryFullName: string;
    name: string;
    description?: string;
    leaderAgentId: string;
    memberAgentIds?: string[];
  }) => {
    return lambdaClient.squad.create.mutate(input);
  };

  update = async (id: string, input: {
    name?: string;
    description?: string;
    leaderAgentId?: string;
  }) => {
    return lambdaClient.squad.update.mutate({ id, ...input });
  };

  delete = async (id: string) => {
    return lambdaClient.squad.delete.mutate({ id });
  };

  addMember = async (squadId: string, agentId: string, role?: string) => {
    return lambdaClient.squad.addMember.mutate({ squadId, agentId, role });
  };

  removeMember = async (squadId: string, agentId: string) => {
    return lambdaClient.squad.removeMember.mutate({ squadId, agentId });
  };
}

export const squadClientService = new SquadClientService();
