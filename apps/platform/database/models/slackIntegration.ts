import { and, eq } from 'drizzle-orm';
import { slackIntegrations, organizations } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export class SlackIntegrationModel {
  constructor(private db: ThinkThrooDatabase, private userId: string) {}

  getByOrganization = async (organizationId: string) => {
    const [row] = await this.db
      .select({
        id: slackIntegrations.id,
        organizationId: slackIntegrations.organizationId,
        teamId: slackIntegrations.teamId,
        teamName: slackIntegrations.teamName,
        channelId: slackIntegrations.channelId,
        channelName: slackIntegrations.channelName,
        botUserId: slackIntegrations.botUserId,
        notifyPrReviews: slackIntegrations.notifyPrReviews,
        notifyArchitectureViolations: slackIntegrations.notifyArchitectureViolations,
        isActive: slackIntegrations.isActive,
        createdAt: slackIntegrations.createdAt,
      })
      .from(slackIntegrations)
      .innerJoin(organizations, eq(organizations.id, slackIntegrations.organizationId))
      .where(
        and(
          eq(slackIntegrations.organizationId, organizationId),
          eq(organizations.userId, this.userId),
        ),
      )
      .limit(1);

    return row ?? null;
  };

  upsert = async (data: {
    organizationId: string;
    teamId: string;
    teamName: string;
    accessToken: string;
    channelId: string;
    channelName: string;
    webhookUrl: string;
    botUserId: string;
  }) => {
    // Check if integration already exists for this org
    const existing = await this.db
      .select({ id: slackIntegrations.id })
      .from(slackIntegrations)
      .innerJoin(organizations, eq(organizations.id, slackIntegrations.organizationId))
      .where(
        and(
          eq(slackIntegrations.organizationId, data.organizationId),
          eq(organizations.userId, this.userId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(slackIntegrations)
        .set({
          teamId: data.teamId,
          teamName: data.teamName,
          accessToken: data.accessToken,
          channelId: data.channelId,
          channelName: data.channelName,
          webhookUrl: data.webhookUrl,
          botUserId: data.botUserId,
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(slackIntegrations.id, existing[0].id));

      return existing[0].id;
    }

    const [row] = await this.db
      .insert(slackIntegrations)
      .values({
        organizationId: data.organizationId,
        teamId: data.teamId,
        teamName: data.teamName,
        accessToken: data.accessToken,
        channelId: data.channelId,
        channelName: data.channelName,
        webhookUrl: data.webhookUrl,
        botUserId: data.botUserId,
      })
      .returning({ id: slackIntegrations.id });

    return row.id;
  };

  updateNotificationSettings = async (
    organizationId: string,
    settings: { notifyPrReviews?: boolean; notifyArchitectureViolations?: boolean },
  ) => {
    await this.db
      .update(slackIntegrations)
      .set({
        ...settings,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(slackIntegrations.organizationId, organizationId),
        ),
      );
  };

  disconnect = async (organizationId: string) => {
    await this.db
      .update(slackIntegrations)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(slackIntegrations.organizationId, organizationId));
  };

  delete = async (organizationId: string) => {
    await this.db
      .delete(slackIntegrations)
      .where(eq(slackIntegrations.organizationId, organizationId));
  };
}
