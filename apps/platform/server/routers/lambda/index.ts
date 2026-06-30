import { router } from '@/lib/trpc/lambda';
import { documentRouter } from './document';
import { organizationRouter } from './organization';
import { installationRouter } from './installation';
import { courseProgressRouter } from './courseProgress';
import { reviewRouter } from './review';
import { analyticsRouter } from './analytics';
import { slackRouter } from './slack';
import { inviteRouter } from './invite';
import { repositorySettingsRouter } from './repositorySettings';
import { organizationSettingsRouter } from './organizationSettings';
import { issueRouter } from './issues';
import { agentRouter } from './agent';
import { agentTaskRouter } from './agentTask';
import { issueCommentRouter } from './issueComment';

export const lambdaRouter = router({
  document: documentRouter,
  organization: organizationRouter,
  installation: installationRouter,
  courseProgress: courseProgressRouter,
  review: reviewRouter,
  analytics: analyticsRouter,
  slack: slackRouter,
  invite: inviteRouter,
  repositorySettings: repositorySettingsRouter,
  organizationSettings: organizationSettingsRouter,
  issues: issueRouter,
  agent: agentRouter,
  agentTask: agentTaskRouter,
  issueComment: issueCommentRouter,
});export type LambdaRouter = typeof lambdaRouter;