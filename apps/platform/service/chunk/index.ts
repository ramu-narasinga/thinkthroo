import { ThinkThrooDatabase } from "@/database";
import { ChunkModel } from "@/database/models/chunk";
import { ClientSecretPayload } from "@/types/auth";

export class ChunkService {
  // private userId: string;
  // private chunkClient: ContentChunk;
  // private fileModel: FileModel;
  // private asyncTaskModel: AsyncTask;

  private userId: string;
  private db: ThinkThrooDatabase;
  private chunkModel: ChunkModel;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.chunkModel = new ChunkModel(db, userId);
  }

  /**
   * parse file to chunks with async task
   */
  async asyncParseFileToChunks(
    // fileId: string,
    // payload: ClientSecretPayload,
    // skipExist?: boolean
  ) {
    // const result = await this.fileModel.findById(fileId);

    // if (!result) return;

    // // skip if already exist chunk tasks
    // if (skipExist && result.chunkTaskId) return;

    // // 1. create a asyncTaskId
    // const asyncTaskId = await this.asyncTaskModel.create({
    //   status: AsyncTaskStatus.Processing,
    //   type: AsyncTaskType.Chunking,
    // });

    // await this.fileModel.update(fileId, { chunkTaskId: asyncTaskId });

    // const asyncCaller = await createAsyncCaller({
    //   jwtPayload: payload,
    //   userId: this.userId,
    // });

    // // trigger parse file task asynchronously
    // asyncCaller.file
    //   .parseFileToChunks({ fileId: fileId, taskId: asyncTaskId })
    //   .catch(async (e) => {
    //     console.error("[ParseFileToChunks] error:", e);

    //     await this.asyncTaskModel.update(asyncTaskId, {
    //       error: new AsyncTaskError(
    //         AsyncTaskErrorType.TaskTriggerError,
    //         "trigger chunk embedding async task error. Please make sure the APP_URL is available from your server. You can check the proxy config or WAF blocking"
    //       ),
    //       status: AsyncTaskStatus.Error,
    //     });
    //   });

    // return asyncTaskId;
  }
}
