import { and, eq } from 'drizzle-orm';
import DodoPayments from 'dodopayments';
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

  async setDodoCustomerId(id: string, dodoCustomerId: string) {
    return this.organizationModel.update(id, { dodoCustomerId });
  }

  async getInvoices(orgId: string) {
    const org = await this.organizationModel.findById(orgId);
    if (!org?.dodoCustomerId) return [];

    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode') as 'test_mode' | 'live_mode',
    });

    const paymentList: any[] = [];
    for await (const payment of dodo.payments.list({ customer_id: org.dodoCustomerId } as any)) {
      paymentList.push(payment);
      if (paymentList.length >= 20) break;
    }

    return paymentList.map((payment: any) => ({
      id: payment.payment_id as string,
      date: (payment.created_at ?? '') as string,
      description: (payment.product_cart?.[0]?.product_id ?? 'Purchase') as string,
      total: String(payment.total_amount ?? '0'),
      currency: (payment.currency ?? 'USD') as string,
      status: (payment.status ?? 'unknown') as string,
      invoiceUrl: null,
    }));
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

    const dodo = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ?? 'test_mode') as 'test_mode' | 'live_mode',
    });

    await dodo.subscriptions.update(sub.subscriptionId, {
      cancel_at_next_billing_date: true,
    } as any);

    await this.db
      .update(subscriptions)
      .set({
        subscriptionStatus: 'cancellation_scheduled',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subscriptions.subscriptionId, sub.subscriptionId));

    return { effectiveAt: null };
  }
}
