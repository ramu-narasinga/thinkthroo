import { lambdaClient } from '@/lib/trpc/client/lambda';

export const agentDocumentSkillClientService = {
  getAgentDocumentSkills: (agentId: string): Promise<string[]> =>
    lambdaClient.agentDocumentSkill.getAgentDocumentSkills.query({ agentId }) as Promise<string[]>,

  setAgentDocumentSkills: (agentId: string, documentIds: string[]): Promise<void> =>
    lambdaClient.agentDocumentSkill.setAgentDocumentSkills.mutate({ agentId, documentIds }) as Promise<void>,
};
