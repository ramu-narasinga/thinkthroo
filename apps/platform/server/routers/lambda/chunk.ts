import { z } from "zod";
import { authedProcedure, router } from "@/lib/trpc/lambda";
import { serverDatabase } from "@/lib/trpc/lambda/middleware";
import { ChunkModel } from "@/database/models/chunk";
import { ChunkService } from "@/service/chunk";
import { EmbeddingService } from "@/service/embedding";
import { SemanticSearchSchema } from "@/types/rag";

const chunkProcedure = authedProcedure
  .use(serverDatabase)
  // .use(keyVaults)
  .use(async (opts) => {
    const { ctx } = opts;
    // const { aiProvider } = await getServerGlobalConfig();

    return opts.next({
      ctx: {
        chunkModel: new ChunkModel(ctx.serverDB, ctx.userId),
        chunkService: new ChunkService(ctx.serverDB, ctx.userId),
        embeddingService: new EmbeddingService(),
      },
    });
  });

export const chunkRouter = router({
  hello: chunkProcedure
    .input(
      z.object({
        text: z.string().optional(),
      })
    )
    .mutation(async (props) => {
      console.log("chunkRouter.hello called", props);
      return {
        greeting: `hello `,
      };
    }),
  createParseFileTask: chunkProcedure
    .input(
      z.object({
        id: z.string(),
        skipExist: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const asyncTaskId = await ctx.chunkService.asyncParseFileToChunks(
        input.id,
        input.skipExist,
      );

      return { id: asyncTaskId, success: true };
    }),
  getChunkCount: chunkProcedure
    .input(
      z.object({
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const count = await ctx.chunkModel.countByFileId(input.fileId);
      return { count };
    }),

  semanticSearch: chunkProcedure
    .input(
      z.object({
        query: z.string(),
        fileIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const embedding = await ctx.embeddingService.embedQuery(input.query);
      return ctx.chunkModel.semanticSearch({
        embedding,
        fileIds: input.fileIds,
        query: input.query,
      });
    }),

  semanticSearchForChat: chunkProcedure
    .input(SemanticSearchSchema)
    .mutation(async ({ ctx, input }) => {
      const queryText = input.rewriteQuery || input.userQuery;
      const embedding = await ctx.embeddingService.embedQuery(queryText);
      return ctx.chunkModel.semanticSearchForChat({
        embedding,
        fileIds: input.fileIds,
        query: queryText,
      });
    }),
});
