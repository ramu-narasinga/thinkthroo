import { ReviewStore } from './store';

export const reviewSelectors = {
  reviews: (s: ReviewStore) => s.reviews,
  isReviewsLoading: (s: ReviewStore) => s.isReviewsLoading,
  isFirstFetchFinished: (s: ReviewStore) => s.isReviewsFirstFetchFinished,
};
