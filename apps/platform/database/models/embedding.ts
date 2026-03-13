import { and, eq, inArray } from 'drizzle-orm';

import { NewEmbeddingsItem, embeddings } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export class EmbeddingModel {
  private userId: string;
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  bulkCreate = async (params: Omit<NewEmbeddingsItem, 'userId'>[]) => {
    if (params.length === 0) return [];

    return this.db
      .insert(embeddings)
      .values(params.map((p) => ({ ...p, userId: this.userId })))
      .onConflictDoNothing()
      .returning({ id: embeddings.id });
  };

  deleteByChunkIds = async (chunkIds: string[]) => {
    if (chunkIds.length === 0) return;
    return this.db
      .delete(embeddings)
      .where(
        and(
          inArray(embeddings.chunkId, chunkIds),
          eq(embeddings.userId, this.userId),
        ),
      );
  };
}
