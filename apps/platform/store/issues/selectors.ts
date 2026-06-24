import { IssueStoreState } from './initialState';

export const issueSelectors = {
  issues: (s: IssueStoreState) => s.issues,
  isLoading: (s: IssueStoreState) => s.isLoading,
  isFirstFetchFinished: (s: IssueStoreState) => s.isFirstFetchFinished,
  page: (s: IssueStoreState) => s.page,
  hasMore: (s: IssueStoreState) => s.hasMore,
  stateFilter: (s: IssueStoreState) => s.stateFilter,
};
