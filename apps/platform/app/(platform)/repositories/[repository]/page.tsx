import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ repository: string }>;
}) {
  const { repository } = await params;
  Sentry.logger.info(
    Sentry.logger.fmt`Repository page accessed, redirecting to architecture`,
    {
      repository,
      timestamp: new Date().toISOString(),
    }
  );
  redirect(`/repositories/${repository}/architecture`);
}
