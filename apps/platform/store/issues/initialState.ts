export interface IssueLabel {
  name: string;
  color: string;
}

export interface IssueItem {
  id: number;
  number: number;
  title: string;
  state: string;
  htmlUrl: string;
  author: string;
  authorAvatarUrl: string;
  labels: IssueLabel[];
  createdAt: string;
  updatedAt: string;
}

export type IssueState = 'open' | 'closed' | 'all';

export interface IssueStoreState {
  issues: IssueItem[];
  isLoading: boolean;
  isFirstFetchFinished: boolean;
  page: number;
  hasMore: boolean;
  stateFilter: IssueState;
}

export const initialState: IssueStoreState = {
  issues: [],
  isLoading: false,
  isFirstFetchFinished: false,
  page: 1,
  hasMore: false,
  stateFilter: 'open',
};
