import { StateCreator } from 'zustand/vanilla';
import { IssueBoardStateStore } from '../../store';
import { IssueBoardItem } from '../../initialState';
import { issueBoardStateClientService, KanbanStatus } from '@/service/issueBoardState/client';

export interface IssueBoardStateAction {
  fetchBoard: (repositoryFullName: string) => Promise<void>;
  addToBoard: (repositoryFullName: string, issue: { number: number; title: string; htmlUrl: string }) => Promise<IssueBoardItem>;
  moveCard: (repositoryFullName: string, issueNumber: number, kanbanStatus: KanbanStatus) => Promise<{ enqueuedTask: unknown | null }>;
  updateAssignee: (
    repositoryFullName: string,
    issueNumber: number,
    assigneeType: 'agent' | 'member' | null,
    assigneeAgentId?: string | null,
    assigneeMemberId?: string | null
  ) => Promise<void>;
  removeFromBoard: (repositoryFullName: string, issueNumber: number) => Promise<void>;
  upsertBoardItem: (item: IssueBoardItem) => void;
  syncFromGitHub: (repositoryFullName: string) => Promise<{ synced: number }>;
  createIssue: (repositoryFullName: string, title: string, body?: string) => Promise<IssueBoardItem>;
}

export const createIssueBoardStateSlice: StateCreator<
  IssueBoardStateStore,
  [['zustand/devtools', never]],
  [],
  IssueBoardStateAction
> = (set) => ({
  fetchBoard: async (repositoryFullName) => {
    set({ isLoading: true }, false, 'fetchBoard/start');
    try {
      const boardItems = await issueBoardStateClientService.getByRepository(repositoryFullName);
      set({ boardItems, isFirstFetchFinished: true, isLoading: false }, false, 'fetchBoard/success');
    } catch (error) {
      console.error('[IssueBoardStateStore] Error fetching board:', error);
      set({ isLoading: false }, false, 'fetchBoard/error');
    }
  },

  addToBoard: async (repositoryFullName, issue) => {
    const item = await issueBoardStateClientService.addToBoard({
      repositoryFullName,
      issueNumber: issue.number,
      issueTitle: issue.title,
      issueHtmlUrl: issue.htmlUrl,
    });
    set(
      (s) => {
        const exists = s.boardItems.some((b) => b.issueNumber === item.issueNumber);
        return {
          boardItems: exists
            ? s.boardItems.map((b) => (b.issueNumber === item.issueNumber ? item : b))
            : [...s.boardItems, item],
        };
      },
      false,
      'addToBoard'
    );
    return item;
  },

  moveCard: async (repositoryFullName, issueNumber, kanbanStatus) => {
    // Optimistic update
    set(
      (s) => ({
        boardItems: s.boardItems.map((b) =>
          b.issueNumber === issueNumber ? { ...b, kanbanStatus } : b
        ),
      }),
      false,
      'moveCard/optimistic'
    );

    try {
      const result = await issueBoardStateClientService.updateKanbanStatus({
        repositoryFullName,
        issueNumber,
        kanbanStatus,
      });
      // Reconcile with server response
      set(
        (s) => ({
          boardItems: s.boardItems.map((b) =>
            b.issueNumber === issueNumber ? result.boardState : b
          ),
        }),
        false,
        'moveCard/success'
      );
      return { enqueuedTask: result.enqueuedTask };
    } catch (error) {
      console.error('[IssueBoardStateStore] Error moving card:', error);
      // Revert optimistic update by re-fetching is handled by the component
      throw error;
    }
  },

  updateAssignee: async (repositoryFullName, issueNumber, assigneeType, assigneeAgentId, assigneeMemberId) => {
    const updated = await issueBoardStateClientService.updateAssignee({
      repositoryFullName,
      issueNumber,
      assigneeType,
      assigneeAgentId,
      assigneeMemberId,
    });
    set(
      (s) => ({
        boardItems: s.boardItems.map((b) => (b.issueNumber === issueNumber ? updated : b)),
      }),
      false,
      'updateAssignee'
    );
  },

  removeFromBoard: async (repositoryFullName, issueNumber) => {
    await issueBoardStateClientService.removeFromBoard({ repositoryFullName, issueNumber });
    set(
      (s) => ({ boardItems: s.boardItems.filter((b) => b.issueNumber !== issueNumber) }),
      false,
      'removeFromBoard'
    );
  },

  upsertBoardItem: (item) => {
    set(
      (s) => {
        const exists = s.boardItems.some((b) => b.id === item.id);
        return {
          boardItems: exists
            ? s.boardItems.map((b) => (b.id === item.id ? item : b))
            : [...s.boardItems, item],
        };
      },
      false,
      'upsertBoardItem'
    );
  },

  syncFromGitHub: async (repositoryFullName) => {
    const result = await issueBoardStateClientService.syncFromGitHub(repositoryFullName);
    // Re-fetch board to get the synced items
    const boardItems = await issueBoardStateClientService.getByRepository(repositoryFullName);
    set({ boardItems }, false, 'syncFromGitHub');
    return result;
  },

  createIssue: async (repositoryFullName, title, body) => {
    const item = await issueBoardStateClientService.createIssue({ repositoryFullName, title, body });
    set(
      (s) => ({ boardItems: [...s.boardItems, item] }),
      false,
      'createIssue'
    );
    return item;
  },
});
