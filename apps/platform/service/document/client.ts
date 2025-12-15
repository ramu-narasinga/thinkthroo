import { lambdaClient } from '@/lib/trpc/client/lambda';
import type { DocumentItem } from '@/database/schemas';

export interface CreateDocumentInput {
  repositoryId: string;
  parentId?: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
}

export interface UpdateDocumentInput {
  name?: string;
  content?: string;
  editorData?: Record<string, any>;
}

/**
 * Client-side document service
 * Wraps tRPC/lambda client calls for use in stores and components
 */
export class DocumentClientService {
  /**
   * Get all documents for a repository
   */
  getAllByRepository = async (repositoryId: string): Promise<DocumentItem[]> => {
    return lambdaClient.document.getAllByRepository.query({
      repositoryId,
    });
  };

  /**
   * Get all documents for a repository with minimal fields (excludes content/editorData)
   * Used for file tree to reduce payload size
   */
  getAllByRepositoryMinimal = async (repositoryId: string) => {
    return lambdaClient.document.getAllByRepositoryMinimal.query({
      repositoryId,
    });
  };

  /**
   * Get repository ID by name
   */
  getRepositoryIdByName = async (repositoryName: string) => {
    return lambdaClient.document.getRepositoryIdByName.query({
      repositoryName,
    });
  };

  /**
   * Get document by ID (includes full content and editorData)
   */
  getById = async (id: string): Promise<DocumentItem | undefined> => {
    return lambdaClient.document.getById.query({
      id,
    });
  };

  /**
   * Create a new document
   */
  create = async (input: CreateDocumentInput): Promise<DocumentItem> => {
    return lambdaClient.document.create.mutate(input);
  };

  /**
   * Update a document
   */
  update = async (id: string, input: UpdateDocumentInput): Promise<DocumentItem> => {
    return lambdaClient.document.update.mutate({
      id,
      ...input,
    });
  };

  /**
   * Delete a document
   */
  delete = async (id: string): Promise<void> => {
    await lambdaClient.document.delete.mutate({ id });
  };
}

export const documentClientService = new DocumentClientService();
