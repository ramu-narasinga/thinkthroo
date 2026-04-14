import { and, eq } from 'drizzle-orm';
import { repositorySettings, repositories } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export interface RepositorySettingsData {
  useOrganizationSettings: boolean;
  enableReviews: boolean;
  enablePrSummary: boolean;
  enableInlineReviewComments: boolean;
  enableArchitectureReview: boolean;
  reviewLanguage: string | null;
  toneInstructions: string | null;
  pathFilters: string[];
}

export class RepositorySettingsModel {
  constructor(private db: ThinkThrooDatabase, private userId: string) {}

  getByRepositoryFullName = async (fullName: string) => {
    const [row] = await this.db
      .select()
      .from(repositories)
      .leftJoin(repositorySettings, eq(repositorySettings.repositoryId, repositories.id))
      .where(
        and(
          eq(repositories.fullName, fullName),
          eq(repositories.userId, this.userId),
        ),
      )
      .limit(1);

    if (!row) return null;

    return {
      repositoryId: row.repositories.id,
      organizationId: row.repositories.organizationId,
      useOrganizationSettings: row.repository_settings?.useOrganizationSettings ?? true,
      enableReviews: row.repository_settings?.enableReviews ?? true,
      enablePrSummary: row.repository_settings?.enablePrSummary ?? true,
      enableInlineReviewComments: row.repository_settings?.enableInlineReviewComments ?? false,
      enableArchitectureReview: row.repository_settings?.enableArchitectureReview ?? false,
      reviewLanguage: row.repository_settings?.reviewLanguage ?? null,
      toneInstructions: row.repository_settings?.toneInstructions ?? null,
      pathFilters: row.repository_settings?.pathFilters ?? [],
    };
  };

  upsert = async (
    repositoryId: string,
    organizationId: string,
    data: Partial<RepositorySettingsData>,
  ) => {
    const existing = await this.db
      .select({ id: repositorySettings.id })
      .from(repositorySettings)
      .where(eq(repositorySettings.repositoryId, repositoryId))
      .limit(1);

    if (existing.length > 0) {
      await this.db
        .update(repositorySettings)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(repositorySettings.id, existing[0].id));

      return existing[0].id;
    }

    const [row] = await this.db
      .insert(repositorySettings)
      .values({
        repositoryId,
        organizationId,
        userId: this.userId,
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: repositorySettings.id });

    return row.id;
  };
}
