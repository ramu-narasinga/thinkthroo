import { CohereClient } from 'cohere-ai';

const COHERE_MODEL = 'embed-english-v3.0';
// Dimensions produced by embed-english-v3.0 — must match the schema vector(1024)
export const EMBEDDING_DIMENSIONS = 1024;

type InputType = 'search_document' | 'search_query';

/**
 * Thin wrapper around the Cohere Embed API.
 * - Use inputType 'search_document' when indexing chunks
 * - Use inputType 'search_query'    when embedding a user query at search time
 */
export class EmbeddingService {
  private client: CohereClient;

  constructor() {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) throw new Error('COHERE_API_KEY environment variable is not set');
    this.client = new CohereClient({ token: apiKey });
  }

  /**
   * Embed an array of texts for document indexing.
   * Returns a parallel array of number[] vectors.
   */
  embedDocuments = async (texts: string[]): Promise<number[][]> => {
    return this.embed(texts, 'search_document');
  };

  /**
   * Embed a single query string for similarity search.
   */
  embedQuery = async (text: string): Promise<number[]> => {
    const results = await this.embed([text], 'search_query');
    return results[0]!;
  };

  // ---------------------------------------------------------------------------

  private embed = async (texts: string[], inputType: InputType): Promise<number[][]> => {
    if (texts.length === 0) return [];

    // Cohere allows max 96 texts per request — batch if needed
    const BATCH_SIZE = 96;
    const allVectors: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      const response = await this.client.embed({
        texts: batch,
        model: COHERE_MODEL,
        inputType,
        embeddingTypes: ['float'],
      });

      const floats = response.embeddings;
      // SDK returns embeddings as { float: number[][] } when embeddingTypes is set
      const vectors: number[][] =
        Array.isArray(floats) ? (floats as number[][]) : (floats as any).float;

      allVectors.push(...vectors);
    }

    return allVectors;
  };
}
