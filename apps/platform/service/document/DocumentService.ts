import { DocumentItem } from '@/database/schemas';
import { lambdaClient } from '@/lib/trpc/client';

export interface CreateDocumentInput {
  repositoryId: string;
  parentId?: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  editorData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateDocumentInput {
  name?: string;
  content?: string;
  editorData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export class DocumentService {
  /**
   * Get all documents for a specific repository
   */
  async getAllByRepository(repositoryId: string): Promise<DocumentItem[]> {
    return lambdaClient.document.getAllByRepository.query({ repositoryId });
  }

  /**
   * Get all documents for a repository with minimal fields (excludes content/editorData)
   * Used for file tree to reduce payload size
   */
  async getAllByRepositoryMinimal(repositoryId: string) {
    return lambdaClient.document.getAllByRepositoryMinimal.query({ repositoryId });
  }

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<DocumentItem | undefined> {
    return lambdaClient.document.getById.query({ id });
  }

  /**
   * Create a new document (file or folder)
   */
  async create(input: CreateDocumentInput): Promise<DocumentItem> {
    return lambdaClient.document.create.mutate(input);
  }

  /**
   * Update a document
   */
  async update(id: string, input: UpdateDocumentInput): Promise<DocumentItem> {
    return lambdaClient.document.update.mutate({ id, ...input });
  }

  /**
   * Delete a document
   * Note: Children are cascade deleted via database FK constraint
   */
  async delete(id: string): Promise<void> {
    await lambdaClient.document.delete.mutate({ id });
  }
}

export const documentService = new DocumentService();