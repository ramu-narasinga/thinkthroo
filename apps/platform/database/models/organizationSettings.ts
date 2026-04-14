import { and, eq } from 'drizzle-orm';
import { organizationSettings, organizations } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export interface OrganizationSettingsData {
  enableReviews: boolean;
  enablePrSummary: boolean;
  enableInlineReviewComments: boolean;
  enableArchitectureReview: boolean;
  reviewLanguage: string | null;
  toneInstructions: string | null;
  pathFilters: string[];
}

export class OrganizationSettingsModel {
  constructor(private db: ThinkThrooDatabase, private userId: string) {}

  getByOrganization = async (organizationId: string) => {
    const [row] = await this.db
      .select()
      .from(organizationSettings)
      .innerJoin(organizations, eq(organizations.id, organizationSettings.organizationId))
      .where(
        and(
          eq(organizationSettings.organizationId, organizationId),
          eq(organizations.userId, this.userId),
        ),
      )
      .limit(1);

    return row ? row.organization_settings : null;
  };

  upsert = async (organizationId: string, data: Partial<OrganizationSettingsData>) => {
    const existing = await this.db
      .select({ id: organizationSettings.id })
      .from(organizationSettings)
      .where(eq(organizationSettings.organizationId, organizationId))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(organizationSettings)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(organizationSettings.id, existing[0].id));

      return existing[0].id;
    }

    const [row] = await this.db
      .insert(organizationSettings)
      .values({
        organizationId,
        userId: this.userId,
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: organizationSettings.id });

    return row.id;
  };
}
