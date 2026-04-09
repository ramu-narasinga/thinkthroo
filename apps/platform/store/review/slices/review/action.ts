import { StateCreator } from 'zustand/vanilla';
import { ReviewStore } from '../../store';
import { ReviewItem, ArchitectureFileResult, ReviewStoreState } from '../../initialState';
import { reviewClientService } from '@/service/review';

export interface ReviewAction {
  fetchReviews: (repositoryFullName: string) => Promise<void>;
  fetchArchitectureResults: (prReviewId: string) => Promise<void>;
  internal_updateReviews: (reviews: ReviewItem[]) => void;
  internal_updateArchitectureResults: (prReviewId: string, results: ArchitectureFileResult[]) => void;
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

  fetchArchitectureResults: async (prReviewId) => {
    set(
      (s: ReviewStoreState) => ({ isArchitectureLoading: { ...s.isArchitectureLoading, [prReviewId]: true } }),
      false,
      'fetchArchitectureResults/start',
    );
    try {
      const results = await reviewClientService.getArchitectureResults(prReviewId);
      get().internal_updateArchitectureResults(prReviewId, results);
    } catch (error) {
      console.error('[ReviewStore] Error fetching architecture results:', error);
    } finally {
      set(
        (s: ReviewStoreState) => ({ isArchitectureLoading: { ...s.isArchitectureLoading, [prReviewId]: false } }),
        false,
        'fetchArchitectureResults/done',
      );
    }
  },

  internal_updateReviews: (reviews) => {
    set({ reviews }, false, 'internal_updateReviews');
  },

  internal_updateArchitectureResults: (prReviewId, results) => {
    set(
      (s: ReviewStoreState) => ({ architectureResults: { ...s.architectureResults, [prReviewId]: results } }),
      false,
      'internal_updateArchitectureResults',
    );
  },
});
