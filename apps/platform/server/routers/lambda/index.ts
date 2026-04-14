import { router } from '@/lib/trpc/lambda';
import { documentRouter } from './document';
import { organizationRouter } from './organization';
import { installationRouter } from './installation';
import { courseProgressRouter } from './courseProgress';
import { reviewRouter } from './review';
import { analyticsRouter } from './analytics';
import { slackRouter } from './slack';
import { inviteRouter } from './invite';

export const lambdaRouter = router({
  document: documentRouter,
  organization: organizationRouter,
  installation: installationRouter,
  courseProgress: courseProgressRouter,
  review: reviewRouter,
  analytics: analyticsRouter,
  slack: slackRouter,
  invite: inviteRouter,
});export type LambdaRouter = typeof lambdaRouter;