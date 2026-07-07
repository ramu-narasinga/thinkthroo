import { IssueBoardStateStoreState } from './initialState';

export const boardSelectors = {
  boardItems: (s: IssueBoardStateStoreState) => s.boardItems,
  isLoading: (s: IssueBoardStateStoreState) => s.isLoading,
  isFirstFetchFinished: (s: IssueBoardStateStoreState) => s.isFirstFetchFinished,
};
