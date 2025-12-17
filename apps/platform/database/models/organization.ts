import { and, desc, eq, sql } from 'drizzle-orm';
import { organizations } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export interface NewOrganizationItem {
  githubOrgId: string;
  login?: string;
  avatarUrl?: string;
  description?: string;
  apiUrl?: string;
  reposUrl?: string;
  userId: string;
  lastFetched?: string;
}

export interface UpdateOrganizationItem {
  login?: string;
  avatarUrl?: string;
  description?: string;
  apiUrl?: string;
  reposUrl?: string;
  lastFetched?: string;
}

export class OrganizationModel {
  private userId: string;
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  /**
   * Create a new organization
   */
  create = async (params: NewOrganizationItem) => {
    const [result] = await this.db
      .insert(organizations)
      .values({
        ...params,
        userId: this.userId,
      })
      .returning();

    return result;
  };

  /**
   * Bulk upsert organizations
   * Used for syncing organizations from GitHub
   */
  bulkUpsert = async (params: NewOrganizationItem[]) => {
    if (params.length === 0) return [];

    const values = params.map((org) => ({
      ...org,
      userId: this.userId,
    }));

    const result = await this.db
      .insert(organizations)
      .values(values)
      .onConflictDoUpdate({
        target: [organizations.githubOrgId, organizations.userId],
        set: {
          login: sql`EXCLUDED.login`,
          avatarUrl: sql`EXCLUDED.avatar_url`,
          description: sql`EXCLUDED.description`,
          apiUrl: sql`EXCLUDED.api_url`,
          reposUrl: sql`EXCLUDED.repos_url`,
          lastFetched: sql`EXCLUDED.last_fetched`,
        },
      })
      .returning();

    return result;
  };

  /**
   * Find organization by ID
   */
  findById = async (id: string) => {
    return this.db.query.organizations.findFirst({
      where: and(eq(organizations.id, id), eq(organizations.userId, this.userId)),
    });
  };

  /**
   * Find organization by GitHub org ID
   */
  findByGithubOrgId = async (githubOrgId: string) => {
    return this.db.query.organizations.findFirst({
      where: and(
        eq(organizations.githubOrgId, githubOrgId),
        eq(organizations.userId, this.userId)
      ),
    });
  };

  /**
   * Get all organizations for the current user
   */
  findAll = async () => {
    const result = await this.db
      .select({
        id: organizations.id,
        githubOrgId: organizations.githubOrgId,
        login: organizations.login,
        avatarUrl: organizations.avatarUrl,
        description: organizations.description,
        apiUrl: organizations.apiUrl,
        reposUrl: organizations.reposUrl,
        lastFetched: organizations.lastFetched,
      })
      .from(organizations)
      .where(eq(organizations.userId, this.userId))
      .orderBy(desc(organizations.lastFetched));

    return result;
  };

  /**
   * Update organization by ID
   */
  update = async (id: string, data: UpdateOrganizationItem) => {
    const [result] = await this.db
      .update(organizations)
      .set(data)
      .where(and(eq(organizations.id, id), eq(organizations.userId, this.userId)))
      .returning();

    return result;
  };

  /**
   * Delete organization by ID
   */
  delete = async (id: string) => {
    return this.db
      .delete(organizations)
      .where(and(eq(organizations.id, id), eq(organizations.userId, this.userId)));
  };

  /**
   * Delete organization by GitHub org ID
   */
  deleteByGithubOrgId = async (githubOrgId: string) => {
    return this.db
      .delete(organizations)
      .where(
        and(
          eq(organizations.githubOrgId, githubOrgId),
          eq(organizations.userId, this.userId)
        )
      );
  };
}
