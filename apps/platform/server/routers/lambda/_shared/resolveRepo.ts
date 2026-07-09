import { and, eq } from 'drizzle-orm';
import { repositories } from '@/database/schemas';

export async function resolveRepo(
  db: typeof import('@/database').serverDB,
  repositoryFullName: string,
  userId: string
) {
  const [repo] = await db
    .select({
      id: repositories.id,
      fullName: repositories.fullName,
      installationId: repositories.installationId,
      organizationId: repositories.organizationId,
    })
    .from(repositories)
    .where(and(eq(repositories.fullName, repositoryFullName), eq(repositories.userId, userId)))
    .limit(1);
  return repo ?? null;
}
