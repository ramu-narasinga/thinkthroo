import { z } from "zod";
import { authedProcedure, router } from "@/lib/trpc/lambda";
import { serverDatabase } from "@/lib/trpc/lambda/middleware";

const chunkProcedure = authedProcedure
  .use(serverDatabase)
  // .use(keyVaults)
  .use(async (opts) => {
    const { ctx } = opts;
    // const { aiProvider } = await getServerGlobalConfig();

    return opts.next({
      ctx: {
        // aiInfraRepos: new AiInfraRepos(
        //   ctx.serverDB,
        //   ctx.userId,
        //   aiProvider as Record<string, ProviderConfig>,
        // ),
        // asyncTaskModel: new AsyncTaskModel(ctx.serverDB, ctx.userId),
        chunkModel: new ChunkModel(ctx.serverDB, ctx.userId),
        chunkService: new ChunkService(ctx.serverDB, ctx.userId),
        // documentModel: new DocumentModel(ctx.serverDB, ctx.userId),
        // documentService: new DocumentService(ctx.serverDB, ctx.userId),
        // embeddingModel: new EmbeddingModel(ctx.serverDB, ctx.userId),
        // fileModel: new FileModel(ctx.serverDB, ctx.userId),
        // messageModel: new MessageModel(ctx.serverDB, ctx.userId),
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
        // ctx.jwtPayload,
        input.skipExist
      );

      return { id: asyncTaskId, success: true };
    }),
});
