import { IssueBoardItem } from '@/service/issueBoardState/client';

export type { IssueBoardItem };

export interface IssueBoardStateStoreState {
  boardItems: IssueBoardItem[];
  isLoading: boolean;
  isFirstFetchFinished: boolean;
}

export const initialState: IssueBoardStateStoreState = {
  boardItems: [],
  isLoading: false,
  isFirstFetchFinished: false,
};
