import { router } from '@/lib/trpc/lambda';
import { chunkRouter } from './chunk';
import { documentRouter } from './document';
import { organizationRouter } from './organization';
import { installationRouter } from './installation';

export const lambdaRouter = router({
  chunk: chunkRouter,
  document: documentRouter,
  organization: organizationRouter,
  installation: installationRouter,
});export type LambdaRouter = typeof lambdaRouter;