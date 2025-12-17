import { and, desc, eq } from 'drizzle-orm';

import { DocumentItem, NewDocument, documents } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export class DocumentModel {
  private userId: string;
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewDocument, 'userId'>): Promise<DocumentItem> => {
    const result = (await this.db
      .insert(documents)
      .values({ ...params, userId: this.userId })
      .returning()) as DocumentItem[];

    return result[0]!;
  };

  delete = async (id: string) => {
    return this.db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(documents).where(eq(documents.userId, this.userId));
  };

  query = async (): Promise<DocumentItem[]> => {
    return this.db.query.documents.findMany({
      orderBy: [desc(documents.updatedAt)],
      where: eq(documents.userId, this.userId),
    });
  };

  /**
   * Query all documents for a specific repository
   */
  queryByRepository = async (repositoryId: string): Promise<DocumentItem[]> => {
    return this.db.query.documents.findMany({
      orderBy: [desc(documents.updatedAt)],
      where: and(eq(documents.userId, this.userId), eq(documents.repositoryId, repositoryId)),
    });
  };

  /**
   * Query all documents for a repository with minimal fields (excludes content/editorData)
   * Used for file tree to reduce payload size
   */
  queryByRepositoryMinimal = async (repositoryId: string) => {
    return this.db.query.documents.findMany({
      orderBy: [desc(documents.updatedAt)],
      where: and(eq(documents.userId, this.userId), eq(documents.repositoryId, repositoryId)),
      columns: {
        id: true,
        name: true,
        type: true,
        parentId: true,
        repositoryId: true,
        metadata: true,
        totalCharCount: true,
        totalLineCount: true,
        userId: true,
        clientId: true,
        slug: true,
        chunkTaskId: true,
        embeddingTaskId: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude content and editorData
        content: false,
        editorData: false,
      },
    });
  };

  findById = async (id: string): Promise<DocumentItem | undefined> => {
    return this.db.query.documents.findFirst({
      where: and(eq(documents.userId, this.userId), eq(documents.id, id)),
    });
  };

  /**
   * Find document by parent ID and name (for duplicate checking)
   */
  findByParentAndName = async (
    repositoryId: string,
    parentId: string | null,
    name: string
  ): Promise<DocumentItem | undefined> => {
    const conditions = [
      eq(documents.userId, this.userId),
      eq(documents.repositoryId, repositoryId),
      eq(documents.name, name),
    ];

    if (parentId) {
      conditions.push(eq(documents.parentId, parentId));
    } else {
      // For root level, check where parentId is null
      conditions.push(eq(documents.parentId, parentId as any));
    }

    return this.db.query.documents.findFirst({
      where: and(...conditions),
    });
  };

  update = async (id: string, value: Partial<DocumentItem>) => {
    const result = await this.db
      .update(documents)
      .set({ ...value, updatedAt: new Date().toISOString() })
      .where(and(eq(documents.userId, this.userId), eq(documents.id, id)))
      .returning();

    return result[0];
  };
}