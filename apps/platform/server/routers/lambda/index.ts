import { router } from '@/lib/trpc/lambda';
import { documentRouter } from './document';
import { organizationRouter } from './organization';
import { installationRouter } from './installation';
import { courseProgressRouter } from './courseProgress';
import { reviewRouter } from './review';
import { analyticsRouter } from './analytics';
import { slackRouter } from './slack';

export const lambdaRouter = router({
  document: documentRouter,
  organization: organizationRouter,
  installation: installationRouter,
  courseProgress: courseProgressRouter,
  review: reviewRouter,
  analytics: analyticsRouter,
  slack: slackRouter,
});export type LambdaRouter = typeof lambdaRouter;