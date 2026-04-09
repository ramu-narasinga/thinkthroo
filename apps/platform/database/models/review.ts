import { and, desc, eq } from 'drizzle-orm';
import { prReviews, organizations } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export class ReviewModel {
  constructor(private db: ThinkThrooDatabase, private userId: string) {}

  getByRepository = async (repositoryFullName: string, page: number, pageSize: number) => {
    const offset = (page - 1) * pageSize;
    return this.db
      .select({
        id: prReviews.id,
        repositoryFullName: prReviews.repositoryFullName,
        prNumber: prReviews.prNumber,
        prTitle: prReviews.prTitle,
        summaryPoints: prReviews.summaryPoints,
        creditsDeducted: prReviews.creditsDeducted,
        createdAt: prReviews.createdAt,
      })
      .from(prReviews)
      .innerJoin(organizations, eq(organizations.id, prReviews.organizationId))
      .where(and(
        eq(prReviews.repositoryFullName, repositoryFullName),
        eq(organizations.userId, this.userId),
      ))
      .orderBy(desc(prReviews.createdAt))
      .limit(pageSize)
      .offset(offset);
  };
}
