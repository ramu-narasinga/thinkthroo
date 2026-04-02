import { Pinecone } from '@pinecone-database/pinecone';

export interface PublishDocumentMetadata {
  name: string;
  repositoryId: string;
}

class PineconeService {
  private client: Pinecone;
  private indexName: string;

  constructor() {
    const apiKey = process.env.PINECONE_KEY;
    if (!apiKey) throw new Error('PINECONE_KEY environment variable is not set');

    const indexName = process.env.PINECONE_INDEX;
    if (!indexName) throw new Error('PINECONE_INDEX environment variable is not set');

    this.client = new Pinecone({ apiKey });
    this.indexName = indexName;
  }

  /**
   * Upsert a document's markdown content into Pinecone.
   * - namespace = userId  (one namespace per user)
   * - id        = documentId
   * - chunk_text field is what the integrated embedding model reads
   */
  publishDocument = async (
    userId: string,
    documentId: string,
    markdown: string,
    metadata: PublishDocumentMetadata,
  ): Promise<void> => {
    const index = this.client.index(this.indexName);

    await index.namespace(userId).upsertRecords([
      {
        _id: documentId,
        chunk_text: markdown,
        name: metadata.name,
        repositoryId: metadata.repositoryId,
      },
    ]);
  };

  /**
   * Delete a document's vector from Pinecone.
   */
  deleteDocument = async (userId: string, documentId: string): Promise<void> => {
    const index = this.client.index(this.indexName);
    await index.namespace(userId).deleteOne(documentId);
  };

  /**
   * Query Pinecone for architecture rule chunks relevant to a given code snippet.
   * - namespace = userId
   * - filters by repositoryId metadata field
   * - uses integrated embedding model (query text → vector automatically)
   */
  queryDocuments = async (
    userId: string,
    repositoryId: string,
    queryText: string,
    topK: number = 5,
  ): Promise<Array<{ id: string; score: number; text: string; name: string }>> => {
    const index = this.client.index(this.indexName);

    const results = await index.namespace(userId).searchRecords({
      query: {
        topK,
        inputs: { text: queryText },
        filter: { repositoryId: { $eq: repositoryId } },
      },
      fields: ['chunk_text', 'name'],
    });

    return results.result.hits.map((hit: { _id: string; _score: number; fields?: Record<string, unknown> }) => {
      const fields = hit.fields;
      return {
        id: hit._id,
        score: hit._score,
        text: (fields?.chunk_text as string) ?? '',
        name: (fields?.name as string) ?? '',
      };
    });
  };
}

export const pineconeService = new PineconeService();
