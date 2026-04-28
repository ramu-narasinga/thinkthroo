export interface ArchitectureDocRef {
  name: string;
  excerpt: string;
  documentId: string | null;
}

export interface ArchitectureViolation {
  startLine: number;
  endLine: number;
  comment: string;
}

export interface ArchitectureFileResult {
  id: string;
  filename: string;
  violationCount: number;
  score: number;
  violations: ArchitectureViolation[];
  docReferences: ArchitectureDocRef[];
  creditsDeducted: number;
}

export interface InlineReviewComment {
  id: string;
  filename: string;
  startLine: number;
  endLine: number;
  comment: string;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  repositoryFullName: string;
  prNumber: number;
  prTitle: string;
  prAuthor: string;
  summaryPoints: string[];
  creditsDeducted: number;
  slackStatus: string;
  createdAt: string;
}

export interface ReviewStoreState {
  reviews: ReviewItem[];
  isReviewsLoading: boolean;
  isReviewsFirstFetchFinished: boolean;
  architectureResults: Record<string, ArchitectureFileResult[]>; // keyed by prReviewId
  isArchitectureLoading: Record<string, boolean>;
  inlineReviews: Record<string, InlineReviewComment[]>; // keyed by prReviewId
  isInlineLoading: Record<string, boolean>;
}

export const initialState: ReviewStoreState = {
  reviews: [],
  isReviewsLoading: false,
  isReviewsFirstFetchFinished: false,
  architectureResults: {},
  isArchitectureLoading: {},
  inlineReviews: {},
  isInlineLoading: {},
};
