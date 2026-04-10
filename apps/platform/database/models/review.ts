import { and, desc, eq, sql, gte, lte, count, avg, sum } from 'drizzle-orm';
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
        creditsDeducted: prArchitectureFileResults.creditsDeducted,
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

  getWeeklyAnalytics = async (organizationId: string, startDate: string, endDate: string, repositoryFullName?: string) => {
    const conditions = [
      eq(prReviews.organizationId, organizationId),
      eq(organizations.userId, this.userId),
      gte(prReviews.createdAt, startDate),
      lte(prReviews.createdAt, endDate),
    ];

    if (repositoryFullName) {
      conditions.push(eq(prReviews.repositoryFullName, repositoryFullName));
    }

    return this.db
      .select({
        week: sql<string>`to_char(date_trunc('week', ${prReviews.createdAt}), 'MM/DD')`.as('week'),
        weekStart: sql<string>`date_trunc('week', ${prReviews.createdAt})::text`.as('week_start'),
        prsReviewed: sql<number>`count(distinct ${prReviews.id})::int`.as('prs_reviewed'),
        totalViolations: sql<number>`coalesce(sum(${prArchitectureFileResults.violationCount}), 0)::int`.as('total_violations'),
        avgComplianceScore: sql<number>`coalesce(avg(${prArchitectureFileResults.score}), 100)::numeric(5,1)`.as('avg_compliance_score'),
        cleanPrs: sql<number>`count(distinct ${prReviews.id}) filter (where coalesce(${prArchitectureFileResults.violationCount}, 0) = 0)::int`.as('clean_prs'),
      })
      .from(prReviews)
      .innerJoin(organizations, eq(organizations.id, prReviews.organizationId))
      .leftJoin(prArchitectureFileResults, eq(prArchitectureFileResults.prReviewId, prReviews.id))
      .where(and(...conditions))
      .groupBy(sql`date_trunc('week', ${prReviews.createdAt})`)
      .orderBy(sql`date_trunc('week', ${prReviews.createdAt})`);
  };

  getHotspotFiles = async (organizationId: string, startDate: string, endDate: string, repositoryFullName?: string, limit: number = 10) => {
    const conditions = [
      eq(prReviews.organizationId, organizationId),
      eq(organizations.userId, this.userId),
      gte(prReviews.createdAt, startDate),
      lte(prReviews.createdAt, endDate),
    ];

    if (repositoryFullName) {
      conditions.push(eq(prReviews.repositoryFullName, repositoryFullName));
    }

    return this.db
      .select({
        filename: prArchitectureFileResults.filename,
        totalViolations: sql<number>`sum(${prArchitectureFileResults.violationCount})::int`.as('total_violations'),
        avgScore: sql<number>`avg(${prArchitectureFileResults.score})::numeric(5,1)`.as('avg_score'),
        prCount: sql<number>`count(distinct ${prReviews.id})::int`.as('pr_count'),
      })
      .from(prArchitectureFileResults)
      .innerJoin(prReviews, eq(prReviews.id, prArchitectureFileResults.prReviewId))
      .innerJoin(organizations, eq(organizations.id, prReviews.organizationId))
      .where(and(...conditions))
      .groupBy(prArchitectureFileResults.filename)
      .orderBy(sql`sum(${prArchitectureFileResults.violationCount}) desc`)
      .limit(limit);
  };

  getTopViolatedRules = async (organizationId: string, startDate: string, endDate: string, repositoryFullName?: string, limit: number = 10) => {
    const conditions = [
      eq(prReviews.organizationId, organizationId),
      eq(organizations.userId, this.userId),
      gte(prReviews.createdAt, startDate),
      lte(prReviews.createdAt, endDate),
    ];

    if (repositoryFullName) {
      conditions.push(eq(prReviews.repositoryFullName, repositoryFullName));
    }

    // doc_references is a JSON text column: [{name, excerpt, documentId}]
    // We unnest the JSON array and count by rule name
    return this.db.execute(sql`
      SELECT
        ref->>'name' AS rule_name,
        count(*)::int AS violation_count,
        count(distinct pr.id)::int AS pr_count
      FROM pr_architecture_file_results af
      JOIN pr_reviews pr ON pr.id = af.pr_review_id
      JOIN organizations org ON org.id = pr.organization_id,
      json_array_elements(af.doc_references::json) AS ref
      WHERE pr.organization_id = ${organizationId}
        AND org.user_id = ${this.userId}
        AND pr.created_at >= ${startDate}
        AND pr.created_at <= ${endDate}
        ${repositoryFullName ? sql`AND pr.repository_full_name = ${repositoryFullName}` : sql``}
      GROUP BY ref->>'name'
      ORDER BY count(*) DESC
      LIMIT ${limit}
    `);
  };
}
