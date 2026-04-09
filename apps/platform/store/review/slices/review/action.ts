import { StateCreator } from 'zustand/vanilla';
import { ReviewStore } from '../../store';
import { ReviewItem } from '../../initialState';
import { reviewClientService } from '@/service/review';

export interface ReviewAction {
  fetchReviews: (repositoryFullName: string) => Promise<void>;
  internal_updateReviews: (reviews: ReviewItem[]) => void;
}

export const createReviewSlice: StateCreator<
  ReviewStore,
  [['zustand/devtools', never]],
  [],
  ReviewAction
> = (set, get) => ({
  fetchReviews: async (repositoryFullName) => {
    set({ isReviewsLoading: true }, false, 'fetchReviews/start');
    try {
      const reviews = await reviewClientService.getByRepository(repositoryFullName);
      get().internal_updateReviews(reviews);
      set({ isReviewsFirstFetchFinished: true, isReviewsLoading: false }, false, 'fetchReviews/success');
    } catch (error) {
      console.error('[ReviewStore] Error fetching reviews:', error);
      set({ isReviewsLoading: false }, false, 'fetchReviews/error');
    }
  },

  internal_updateReviews: (reviews) => {
    set({ reviews }, false, 'internal_updateReviews');
  },
});
