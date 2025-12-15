import { ThinkThrooDatabase } from '@/database';

import { DocumentModel } from '@/database/models/document';

export class DocumentService {
  userId: string;
  private documentModel: DocumentModel;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.documentModel = new DocumentModel(db, userId);
  }

  /**
   * Update document
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