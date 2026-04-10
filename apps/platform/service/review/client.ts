import { lambdaClient } from '@/lib/trpc/client/lambda';
import { ReviewItem, ArchitectureFileResult } from '@/store/review/initialState';

export class ReviewClientService {
  getByRepository = async (repositoryFullName: string): Promise<ReviewItem[]> => {
    const result = await lambdaClient.review.getByRepository.query({
      repositoryFullName,
      page: 1,
      pageSize: 100,
    });

    return result.map((r) => ({
      id: r.id,
      repositoryFullName: r.repositoryFullName,
      prNumber: r.prNumber,
      prTitle: r.prTitle,
      prAuthor: r.prAuthor ?? '',
      summaryPoints: r.summaryPoints,
      creditsDeducted: r.creditsDeducted,
      slackStatus: r.slackStatus ?? 'pending',
      createdAt: r.createdAt ?? '',
    }));
  };

  getArchitectureResults = async (prReviewId: string): Promise<ArchitectureFileResult[]> => {
    const result = await lambdaClient.review.getArchitectureResults.query({ prReviewId });
    return result.map((r) => ({
      id: r.id,
      filename: r.filename,
      violationCount: r.violationCount,
      score: r.score,
      violations: r.violations,
      docReferences: r.docReferences,
      creditsDeducted: r.creditsDeducted,
    }));
  };
}

export const reviewClientService = new ReviewClientService();
