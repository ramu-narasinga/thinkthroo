import { lambdaClient } from '@/lib/trpc/client/lambda';
import { ReviewItem } from '@/store/review/initialState';

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
      summaryPoints: r.summaryPoints,
      creditsDeducted: r.creditsDeducted,
      createdAt: r.createdAt ?? '',
    }));
  };
}

export const reviewClientService = new ReviewClientService();
