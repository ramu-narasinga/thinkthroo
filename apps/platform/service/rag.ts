import { lambdaClient } from '@/lib/trpc/client';
import { SemanticSearchSchemaType } from '@/types/rag';

class RAGService {
  createParseFileTask = async (id: string, skipExist?: boolean) => {
    return lambdaClient.chunk.createParseFileTask.mutate({ id, skipExist });
  };

  getChunkCount = async (fileId: string): Promise<number> => {
    const result = await lambdaClient.chunk.getChunkCount.query({ fileId });
    return result.count;
  };

  semanticSearch = async (query: string, fileIds?: string[]) => {
    return lambdaClient.chunk.semanticSearch.mutate({ query, fileIds });
  };

  semanticSearchForChat = async (params: SemanticSearchSchemaType) => {
    return lambdaClient.chunk.semanticSearchForChat.mutate(params);
  };
}

export const ragService = new RAGService();