import { and, desc, eq } from 'drizzle-orm';
import { prReviews, prArchitectureFileResults, organizations } from '../schemas';
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
        prAuthor: prReviews.prAuthor,
        summaryPoints: prReviews.summaryPoints,
        creditsDeducted: prReviews.creditsDeducted,
        slackStatus: prReviews.slackStatus,
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

  getArchitectureResults = async (prReviewId: string) => {
    return this.db
      .select({
        id: prArchitectureFileResults.id,
        filename: prArchitectureFileResults.filename,
        violationCount: prArchitectureFileResults.violationCount,
        score: prArchitectureFileResults.score,
        violations: prArchitectureFileResults.violations,
        docReferences: prArchitectureFileResults.docReferences,
      })
      .from(prArchitectureFileResults)
      .innerJoin(prReviews, eq(prReviews.id, prArchitectureFileResults.prReviewId))
      .innerJoin(organizations, eq(organizations.id, prReviews.organizationId))
      .where(and(
        eq(prArchitectureFileResults.prReviewId, prReviewId),
        eq(organizations.userId, this.userId),
      ))
      .orderBy(prArchitectureFileResults.filename);
  };
}
