import { eq, and, sql } from 'drizzle-orm';
import { installations, repositories } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export interface InstallationData {
  installationId: string;
  githubOrgId: string;
  userId: string;
}

export interface RepositoryData {
  githubRepoId: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch?: string;
  private: boolean;
  installationId: string;
  organizationId: string;
  userId: string;
}

export class InstallationModel {
  private userId: string;
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Upsert GitHub installation
   * Uses ON CONFLICT to update if installation already exists
   */
  upsertInstallation = async (data: InstallationData) => {
    const [result] = await this.db
      .insert(installations)
      .values({
        installationId: data.installationId,
        githubOrgId: data.githubOrgId,
        userId: data.userId,
      })
      .onConflictDoUpdate({
        target: [installations.githubOrgId, installations.userId],
        set: {
          installationId: data.installationId,
        },
      })
      .returning();

    return result;
  };

  /**
   * Bulk upsert repositories
   * Updates existing repositories or creates new ones
   */
  bulkUpsertRepositories = async (repos: RepositoryData[]) => {
    if (repos.length === 0) return [];

    const values = repos.map((repo) => ({
      githubRepoId: repo.githubRepoId,
      name: repo.name,
      fullName: repo.fullName,
      htmlUrl: repo.htmlUrl,
      defaultBranch: repo.defaultBranch,
      private: repo.private,
      installationId: repo.installationId,
      organizationId: repo.organizationId,
      userId: repo.userId,
      hasAccess: true,
      lastSyncedAt: new Date(),
      removedAt: null,
    }));

    const result = await this.db
      .insert(repositories)
      .values(values)
      .onConflictDoUpdate({
        target: repositories.githubRepoId,
        set: {
          name: sql`EXCLUDED.name`,
          fullName: sql`EXCLUDED.full_name`,
          htmlUrl: sql`EXCLUDED.html_url`,
          defaultBranch: sql`EXCLUDED.default_branch`,
          private: sql`EXCLUDED.private`,
          installationId: sql`EXCLUDED.installation_id`,
          organizationId: sql`EXCLUDED.organization_id`,
          hasAccess: sql`EXCLUDED.has_access`,
          lastSyncedAt: sql`EXCLUDED.last_synced_at`,
          removedAt: sql`EXCLUDED.removed_at`,
        },
      })
      .returning();

    return result;
  };

  /**
   * Smart sync: Upsert accessible repos, mark removed repos (never delete)
   * This preserves architecture data when access is revoked
   */
  syncRepositories = async (
    installationId: string,
    githubRepos: RepositoryData[]
  ) => {
    // Step 1: Upsert all accessible repos from GitHub (sets has_access = true)
    const upsertedRepos = await this.bulkUpsertRepositories(githubRepos);

    // Step 2: Mark repos as removed if they're no longer in GitHub's response
    const githubRepoIds = githubRepos.map((r) => r.githubRepoId);
    
    if (githubRepoIds.length > 0) {
      await this.db
        .update(repositories)
        .set({
          hasAccess: false,
          removedAt: new Date(),
          lastSyncedAt: new Date(),
        })
        .where(
          and(
            eq(repositories.installationId, installationId),
            eq(repositories.userId, this.userId),
            sql`${repositories.githubRepoId} NOT IN (${sql.join(githubRepoIds.map(id => sql`${id}`), sql`, `)})`
          )
        );
    }

    return upsertedRepos;
  };

  /**
   * Find installation by installation ID
   */
  findByInstallationId = async (installationId: string) => {
    return this.db.query.installations.findFirst({
      where: and(
        eq(installations.installationId, installationId),
        eq(installations.userId, this.userId)
      ),
    });
  };

  /**
   * Find installation by GitHub organization ID
   */
  findByGithubOrgId = async (githubOrgId: string) => {
    return this.db.query.installations.findFirst({
      where: and(
        eq(installations.githubOrgId, githubOrgId),
        eq(installations.userId, this.userId)
      ),
    });
  };

  /**
   * Get all installations for the current user
   */
  findAll = async () => {
    return this.db
      .select()
      .from(installations)
      .where(eq(installations.userId, this.userId));
  };

  /**
   * Get all repositories for an installation
   */
  getRepositoriesByInstallation = async (installationId: string) => {
    return this.db
      .select()
      .from(repositories)
      .where(
        and(
          eq(repositories.installationId, installationId),
          eq(repositories.userId, this.userId)
        )
      );
  };

  /**
   * Get all repositories for the current user
   */
  getAllRepositories = async () => {
    return this.db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, this.userId));
  };

  /**
   * Delete installation
   * Cascade delete will handle repositories
   */
  delete = async (installationId: string) => {
    return this.db
      .delete(installations)
      .where(
        and(
          eq(installations.installationId, installationId),
          eq(installations.userId, this.userId)
        )
      );
  };

  /**
   * Delete repository by ID
   */
  deleteRepository = async (repoId: string) => {
    return this.db
      .delete(repositories)
      .where(
        and(
          eq(repositories.id, repoId),
          eq(repositories.userId, this.userId)
        )
      );
  };
}
