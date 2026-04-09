export interface ReviewItem {
  id: string;
  repositoryFullName: string;
  prNumber: number;
  prTitle: string;
  summaryPoints: string[];
  creditsDeducted: number;
  createdAt: string;
}

export interface ReviewStoreState {
  reviews: ReviewItem[];
  isReviewsLoading: boolean;
  isReviewsFirstFetchFinished: boolean;
}

export const initialState: ReviewStoreState = {
  reviews: [],
  isReviewsLoading: false,
  isReviewsFirstFetchFinished: false,
};
