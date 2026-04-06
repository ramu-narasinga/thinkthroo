import { and, eq } from 'drizzle-orm';
import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { subscriptions } from '@/database/schemas';
import { OrganizationModel } from '@/database/models/organization';
import { ThinkThrooDatabase } from '@/database/type';

export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url: string;
  description?: string;
  url: string;
  repos_url: string;
}

export class OrganizationService {
  private userId: string;
  private db: ThinkThrooDatabase;
  private organizationModel: OrganizationModel;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.organizationModel = new OrganizationModel(db, userId);
  }

  /**
   * Fetch organizations from GitHub API and sync to database
   */
  async syncFromGitHub(accessToken: string) {
    try {
      // 1. Fetch from GitHub API
      const response = await fetch('https://api.github.com/user/orgs', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const orgs: GitHubOrganization[] = await response.json();

      // 2. Map to database format
      const mappedOrgs = orgs.map((org) => ({
        githubOrgId: org.id.toString(),
        login: org.login,
        avatarUrl: org.avatar_url,
        description: org.description,
        apiUrl: org.url,
        reposUrl: org.repos_url,
        userId: this.userId,
        lastFetched: new Date().toISOString(),
      }));

      // 3. Bulk upsert into database
      const result = await this.organizationModel.bulkUpsert(mappedOrgs);

      return result;
    } catch (error) {
      console.error('[OrganizationService] Error syncing from GitHub:', error);
      throw error;
    }
  }

  /**
   * Get all organizations for the current user from database
   */
  async getAll() {
    return this.organizationModel.findAll();
  }

  /**
   * Get organization by ID
   */
  async getById(id: string) {
    return this.organizationModel.findById(id);
  }

  /**
   * Get organization by GitHub org ID
   */
  async getByGithubOrgId(githubOrgId: string) {
    return this.organizationModel.findByGithubOrgId(githubOrgId);
  }

  /**
   * Delete organization
   */
  async delete(id: string) {
    return this.organizationModel.delete(id);
  }

  async setPaddleCustomerId(id: string, paddleCustomerId: string) {
    return this.organizationModel.update(id, { paddleCustomerId });
  }

  async cancelSubscription(orgId: string) {
    const sub = await this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.organizationId, orgId),
        eq(subscriptions.subscriptionStatus, 'active')
      ),
    });

    if (!sub) {
      throw new Error('No active subscription found for this organization');
    }

    const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
      environment: process.env.NODE_ENV === 'production' ? Environment.production : Environment.sandbox,
    });
    const updated = await paddle.subscriptions.cancel(sub.subscriptionId, {
      effectiveFrom: 'next_billing_period',
    });

    const scheduledChangeJson = updated.scheduledChange
      ? JSON.stringify(updated.scheduledChange)
      : null;

    await this.db
      .update(subscriptions)
      .set({
        subscriptionStatus: updated.status,
        scheduledChange: scheduledChangeJson,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subscriptions.subscriptionId, sub.subscriptionId));

    return {
      effectiveAt: (updated.scheduledChange as any)?.effectiveAt ?? null,
    };
  }
}
