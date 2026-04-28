import { TRPCError } from '@trpc/server';
import { ThinkThrooDatabase } from '@/database';
import { DocumentModel } from '@/database/models/document';
import { OrganizationModel } from '@/database/models/organization';
import { DocumentItem, NewDocument } from '@/database/schemas';
import { PLAN_DOC_STORAGE_MB } from '@/const/pricing';

/** Returns the UTF-8 byte size of a string in MB */
function bytesToMB(str: string): number {
  return Buffer.byteLength(str, 'utf-8') / (1024 * 1024);
}

export interface CreateDocumentInput {
  repositoryId: string;
  parentId?: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  editorData?: Record<string, any>;
  metadata?: Record<string, any>;
  /** ID of the org that owns this repository — used for storage accounting */
  organizationId: string;
}

export interface UpdateDocumentInput {
  name?: string;
  content?: string;
  editorData?: Record<string, any>;
  metadata?: Record<string, any>;
  status?: 'draft' | 'published';
  /** Required when content changes — used for storage accounting */
  organizationId?: string;
}

export class DocumentService {
  userId: string;
  private documentModel: DocumentModel;
  private organizationModel: OrganizationModel;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.documentModel = new DocumentModel(db, userId);
    this.organizationModel = new OrganizationModel(db, userId);
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
    const { repositoryId, parentId, name, type, content, editorData, metadata, organizationId } = input;

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

    // Storage accounting for files with content
    let newContentMB = 0;
    let totalByteCount = 0;
    let totalLineCount = 0;

    if (type === 'file' && content) {
      newContentMB = bytesToMB(content);
      totalByteCount = Buffer.byteLength(content, 'utf-8');
      totalLineCount = content.split('\n').length;

      // Enforce storage limit
      const org = await this.organizationModel.findById(organizationId);
      const planName = org?.currentPlanName ?? 'free';
      const limitMB = PLAN_DOC_STORAGE_MB[planName] ?? PLAN_DOC_STORAGE_MB['free']!;
      const usedMB = parseFloat((org?.docStorageUsedMb as unknown as string) ?? '0');

      if (usedMB + newContentMB > limitMB) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Doc storage limit of ${limitMB} MB reached. Upgrade your plan to add more content.`,
        });
      }
    }

    const documentData: Omit<NewDocument, 'userId'> = {
      repositoryId,
      parentId: parentId || null,
      name: normalizedName,
      type,
      content: type === 'file' ? content || '' : null,
      editorData: editorData || null,
      metadata: metadata || null,
      totalCharCount: totalByteCount,
      totalLineCount,
    };

    const document = await this.documentModel.create(documentData);

    // Update org storage counter
    if (type === 'file' && newContentMB > 0) {
      await this.organizationModel.incrementDocStorage(organizationId, newContentMB);
    }

    return document;
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
      const newBytes = Buffer.byteLength(input.content, 'utf-8');
      const oldBytes = document.totalCharCount ?? 0;
      const deltaMB = (newBytes - oldBytes) / (1024 * 1024);

      // Enforce limit only when content grows
      if (deltaMB > 0 && input.organizationId) {
        const org = await this.organizationModel.findById(input.organizationId);
        const planName = org?.currentPlanName ?? 'free';
        const limitMB = PLAN_DOC_STORAGE_MB[planName] ?? PLAN_DOC_STORAGE_MB['free']!;
        const usedMB = parseFloat((org?.docStorageUsedMb as unknown as string) ?? '0');

        if (usedMB + deltaMB > limitMB) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Doc storage limit of ${limitMB} MB reached. Upgrade your plan to add more content.`,
          });
        }
      }

      updateData.content = input.content;
      updateData.totalCharCount = newBytes;
      updateData.totalLineCount = input.content.split('\n').length;

      // Update org storage counter (positive or negative delta)
      if (input.organizationId && deltaMB !== 0) {
        await this.organizationModel.incrementDocStorage(input.organizationId, deltaMB);
      }
    }

    // Handle editor data
    if (input.editorData !== undefined) {
      updateData.editorData = input.editorData;
    }

    // Handle metadata
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata;
    }

    // Handle status
    if (input.status !== undefined) {
      updateData.status = input.status;
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
  async delete(id: string, organizationId?: string): Promise<void> {
    const document = await this.documentModel.findById(id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Reclaim storage before deleting
    if (organizationId && document.type === 'file' && document.totalCharCount) {
      const storedMB = document.totalCharCount / (1024 * 1024);
      await this.organizationModel.incrementDocStorage(organizationId, -storedMB);
    }

    await this.documentModel.delete(id);
  }

  /**
   * Update document (legacy method - consider using update() instead)
   */
  async updateDocument(
    id: string,
    params: {
      content?: string;
    },
  ) {
    const updates: any = {};

    if (params.content !== undefined) {
      updates.content = params.content;
    }

    return this.documentModel.update(id, updates);
  }
}