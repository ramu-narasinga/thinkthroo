import { router } from '@/lib/trpc/lambda';
import { documentRouter } from './document';
import { organizationRouter } from './organization';
import { installationRouter } from './installation';
import { courseProgressRouter } from './courseProgress';
import { inviteRouter } from './invite';

export const lambdaRouter = router({
  document: documentRouter,
  organization: organizationRouter,
  installation: installationRouter,
  courseProgress: courseProgressRouter,
  invite: inviteRouter,
});export type LambdaRouter = typeof lambdaRouter;