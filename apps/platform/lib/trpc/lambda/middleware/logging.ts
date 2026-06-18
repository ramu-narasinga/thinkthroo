import { pino } from '@/lib/logger';
import { trpc } from '../init';

export const loggingMiddleware = trpc.middleware(async (opts) => {
  const { path, type, ctx } = opts;
  const userId = ctx.userId ?? 'unauthenticated';
  const start = Date.now();

  pino.info(`tRPC ${type} ${path} started`, { userId, path, type });

  const result = await opts.next();

  const duration = Date.now() - start;

  if (result.ok) {
    pino.info(`tRPC ${type} ${path} completed`, { userId, path, type, duration });
  } else {
    const cause = result.error.cause as Error | undefined;
    const rootCause = (cause as any)?.cause as Error | undefined;
    pino.error(`tRPC ${type} ${path} failed`, {
      userId,
      path,
      type,
      duration,
      error: result.error.message,
      code: result.error.code,
      cause: cause?.message,
      rootCause: rootCause?.message,
    });
  }

  return result;
});
