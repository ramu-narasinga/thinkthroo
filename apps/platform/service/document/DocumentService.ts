import { DocumentModel } from '@/database/models/document';
import { DocumentItem, NewDocument } from '@/database/schemas';
import { ThinkThrooDatabase } from '@/database/type';

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
  private userId: string;
  private db: ThinkThrooDatabase;
  private documentModel: DocumentModel;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.documentModel = new DocumentModel(db, userId);
  }

  /**
   * Get all documents for a specific repository
   */
  async getAllByRepository(repositoryId: string): Promise<DocumentItem[]> {
    return this.documentModel.queryByRepository(repositoryId);
  }

  /**
   * Get all documents for a repository with minimal fields (excludes content/editorData)
   * Used for file tree to reduce payload size
   */
  async getAllByRepositoryMinimal(repositoryId: string) {
    return this.documentModel.queryByRepositoryMinimal(repositoryId);
  }

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<DocumentItem | undefined> {
    return this.documentModel.findById(id);
  }

  /**
   * Create a new document (file or folder)
   */
  async create(input: CreateDocumentInput): Promise<DocumentItem> {
    const { repositoryId, parentId, name, type, content, editorData, metadata } = input;

    // Normalize name: ensure .md for files
    let normalizedName = name.trim();
    if (type === 'file' && !normalizedName.toLowerCase().endsWith('.md')) {
      normalizedName = `${normalizedName}.md`;
    }

    // Check for duplicates in the same parent folder
    const existing = await this.documentModel.findByParentAndName(
      repositoryId,
      parentId || null,
      normalizedName
    );

    if (existing) {
      throw new Error('A file or folder with that name already exists in this location');
    }

    // Calculate character and line counts for files
    let totalCharCount = 0;
    let totalLineCount = 0;

    if (type === 'file' && content) {
      totalCharCount = content.length;
      totalLineCount = content.split('\n').length;
    }

    const documentData: Omit<NewDocument, 'userId'> = {
      repositoryId,
      parentId: parentId || null,
      name: normalizedName,
      type,
      content: type === 'file' ? content || '' : null,
      editorData: editorData || null,
      metadata: metadata || null,
      totalCharCount,
      totalLineCount,
    };

    return this.documentModel.create(documentData);
  }

  /**
   * Update a document
   */
  async update(id: string, input: UpdateDocumentInput): Promise<DocumentItem> {
    const document = await this.documentModel.findById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    const updateData: Partial<DocumentItem> = {};

    // Handle name change with duplicate check
    if (input.name !== undefined) {
      let normalizedName = input.name.trim();
      if (document.type === 'file' && !normalizedName.toLowerCase().endsWith('.md')) {
        normalizedName = `${normalizedName}.md`;
      }

      // Check if new name conflicts with siblings
      if (normalizedName !== document.name) {
        const existing = await this.documentModel.findByParentAndName(
          document.repositoryId,
          document.parentId || null,
          normalizedName
        );

        if (existing && existing.id !== id) {
          throw new Error('A file or folder with that name already exists in this location');
        }

        updateData.name = normalizedName;
      }
    }

    // Handle content update
    if (input.content !== undefined) {
      updateData.content = input.content;
      updateData.totalCharCount = input.content.length;
      updateData.totalLineCount = input.content.split('\n').length;
    }

    // Handle editor data
    if (input.editorData !== undefined) {
      updateData.editorData = input.editorData;
    }

    // Handle metadata
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata;
    }

    const updated = await this.documentModel.update(id, updateData);
    if (!updated) {
      throw new Error('Failed to update document');
    }

    return updated;
  }

  /**
   * Delete a document
   * Note: Children are cascade deleted via database FK constraint
   */
  async delete(id: string): Promise<void> {
    const document = await this.documentModel.findById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    await this.documentModel.delete(id);
  }
}