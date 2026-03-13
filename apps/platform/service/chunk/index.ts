import { ThinkThrooDatabase } from "@/database";
import { AsyncTaskModel } from "@/database/models/asyncTask";
import { ChunkModel } from "@/database/models/chunk";
import { DocumentModel } from "@/database/models/document";
import { EmbeddingModel } from "@/database/models/embedding";
import { AsyncTaskStatus, AsyncTaskType } from "@/database/schemas/asyncTask";
import { NewChunkItem } from "@/database/schemas/rag";
import { EmbeddingService } from "@/service/embedding";

export class ChunkService {
  private userId: string;
  private db: ThinkThrooDatabase;
  private chunkModel: ChunkModel;
  private documentModel: DocumentModel;
  private asyncTaskModel: AsyncTaskModel;
  private embeddingModel: EmbeddingModel;
  private embeddingService: EmbeddingService;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.chunkModel = new ChunkModel(db, userId);
    this.documentModel = new DocumentModel(db, userId);
    this.asyncTaskModel = new AsyncTaskModel(db, userId);
    this.embeddingModel = new EmbeddingModel(db, userId);
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Create an async chunking task for a document and start processing in the
   * background. Returns the asyncTaskId immediately so the caller isn't blocked.
   */
  async asyncParseFileToChunks(
    fileId: string,
    skipExist?: boolean,
  ): Promise<string | undefined> {
    const doc = await this.documentModel.findById(fileId);
    if (!doc) {
      console.warn(`[ChunkService] Document not found: ${fileId}`);
      return;
    }

    // If already chunked and caller wants to skip, return existing task ID
    if (skipExist && doc.chunkTaskId) {
      return doc.chunkTaskId;
    }

    // 1. Record a new async task
    const asyncTaskId = await this.asyncTaskModel.create({
      type: AsyncTaskType.Chunking,
      status: AsyncTaskStatus.Processing,
    });

    // 2. Link the task to the document
    await this.documentModel.update(fileId, { chunkTaskId: asyncTaskId });

    // 3. Fire the actual chunking in the background (non-blocking)
    this.performChunking(fileId, asyncTaskId, doc.content ?? '').catch(
      async (e: Error) => {
        console.error('[ChunkService] Chunking error:', e);
        await this.asyncTaskModel.update(asyncTaskId, {
          status: AsyncTaskStatus.Error,
          error: { message: e.message, stack: e.stack },
        });
      },
    );

    return asyncTaskId;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Parse the document HTML into plain-text chunks, persist them, then mark
   * the async task as succeeded.
   */
  private async performChunking(
    fileId: string,
    asyncTaskId: string,
    htmlContent: string,
  ) {
    const startTime = Date.now();

    const textChunks = this.parseHtmlToChunks(htmlContent);

    const newChunks: NewChunkItem[] = textChunks.map((text, index) => ({
      text,
      index,
      type: 'paragraph',
      // Stable client ID so re-runs can deduplicate
      clientId: `${fileId}-chunk-${index}`,
      userId: this.userId,
      documentId: fileId,
    }));

    let createdChunks: { id: string }[] = [];
    if (newChunks.length > 0) {
      createdChunks = await this.chunkModel.bulkCreate(newChunks, fileId);
    }

    // Generate and store embeddings for each chunk
    if (createdChunks.length > 0) {
      const vectors = await this.embeddingService.embedDocuments(textChunks);
      await this.embeddingModel.bulkCreate(
        createdChunks.map((chunk, i) => ({
          chunkId: chunk.id,
          embeddings: vectors[i]!,
          model: 'embed-english-v3.0',
          clientId: `${fileId}-embedding-${i}`,
        })),
      );
    }

    await this.asyncTaskModel.update(asyncTaskId, {
      status: AsyncTaskStatus.Success,
      duration: Date.now() - startTime,
      result: { chunksCreated: newChunks.length },
    });
  }

  /**
   * Strip HTML tags from TipTap-generated HTML and split into
   * meaningful plain-text chunks (max ~600 chars each).
   */
  private parseHtmlToChunks(html: string): string[] {
    if (!html.trim()) return [];

    // Convert block-level closing tags to newlines before stripping
    const plain = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|h[1-6]|li|blockquote|pre|div|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    // Split on blank lines → paragraph-level segments
    const segments = plain
      .split(/\n{2,}/)
      .map((s) => s.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((s) => s.length > 0);

    // Merge short segments, split oversized ones
    const MAX = 600;
    const chunks: string[] = [];
    let current = '';

    for (const seg of segments) {
      if (seg.length > MAX) {
        // Save whatever was accumulated
        if (current) { chunks.push(current); current = ''; }
        // Split long segment at sentence boundaries
        const sentences = seg.match(/[^.!?]+[.!?]*/g) ?? [seg];
        for (const sentence of sentences) {
          const s = sentence.trim();
          if (!s) continue;
          if (current.length + s.length + 1 <= MAX) {
            current += (current ? ' ' : '') + s;
          } else {
            if (current) chunks.push(current);
            current = s;
          }
        }
      } else if (current.length + seg.length + 2 <= MAX) {
        current += (current ? '\n\n' : '') + seg;
      } else {
        if (current) chunks.push(current);
        current = seg;
      }
    }

    if (current) chunks.push(current);

    return chunks;
  }
}
