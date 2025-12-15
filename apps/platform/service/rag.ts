import { lambdaClient } from '@/lib/trpc/client';
// import { SemanticSearchSchemaType } from '@/types/rag';

class RAGService {
  // parseFileContent = async (id: string, skipExist?: boolean) => {
  //   return lambdaClient.document.parseFileContent.mutate({ id, skipExist });
  // };

  createParseFileTask = async (id: string, skipExist?: boolean) => {
    // return lambdaClient.chunk.createParseFileTask.mutate({ id, skipExist });
    return lambdaClient.chunk.hello.mutate({ text: id });
  };

  // retryParseFile = async (id: string) => {
  //   return lambdaClient.chunk.retryParseFileTask.mutate({ id });
  // };

  // createEmbeddingChunksTask = async (id: string) => {
  //   return lambdaClient.chunk.createEmbeddingChunksTask.mutate({ id });
  // };

  // semanticSearch = async (query: string, fileIds?: string[]) => {
  //   return lambdaClient.chunk.semanticSearch.mutate({ fileIds, query });
  // };

  // semanticSearchForChat = async (params: SemanticSearchSchemaType) => {
  //   return lambdaClient.chunk.semanticSearchForChat.mutate(params);
  // };

  // deleteMessageRagQuery = async (id: string) => {
  //   return lambdaClient.message.removeMessageQuery.mutate({ id });
  // };
}

export const ragService = new RAGService();