import { StateCreator } from 'zustand/vanilla';
import { IssueStore } from '../../store';
import { IssueItem, IssueState } from '../../initialState';
import { issueClientService } from '@/service/issues/client';

export interface IssueAction {
  fetchIssues: (repositoryFullName: string, page: number, state?: IssueState) => Promise<void>;
  setStateFilter: (state: IssueState) => void;
  setPage: (page: number) => void;
}

export const createIssueSlice: StateCreator<
  IssueStore,
  [['zustand/devtools', never]],
  [],
  IssueAction
> = (set) => ({
  fetchIssues: async (repositoryFullName, page, state = 'open') => {
    set({ isLoading: true }, false, 'fetchIssues/start');
    try {
      const result = await issueClientService.getByRepository(repositoryFullName, page, state);
      set(
        {
          issues: result.issues,
          hasMore: result.hasMore,
          page,
          stateFilter: state,
          isFirstFetchFinished: true,
          isLoading: false,
        },
        false,
        'fetchIssues/success'
      );
    } catch (error) {
      console.error('[IssueStore] Error fetching issues:', error);
      set({ isLoading: false }, false, 'fetchIssues/error');
    }
  },

  setStateFilter: (state) => {
    set({ stateFilter: state, page: 1 }, false, 'setStateFilter');
  },

  setPage: (page) => {
    set({ page }, false, 'setPage');
  },
});
