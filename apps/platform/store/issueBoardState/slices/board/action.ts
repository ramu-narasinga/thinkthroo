import { StateCreator } from 'zustand/vanilla';
import { IssueBoardStateStore } from '../../store';
import { IssueBoardItem } from '../../initialState';
import {
  issueBoardStateClientService,
  KanbanStatus,
  Priority,
  CreateIssueInput,
} from '@/service/issueBoardState/client';

export interface IssueBoardStateAction {
  fetchBoard: (repositoryFullName: string) => Promise<void>;
  addToBoard: (repositoryFullName: string, issue: { number: number; title: string; htmlUrl: string }) => Promise<IssueBoardItem>;
  moveCard: (repositoryFullName: string, issueNumber: number, kanbanStatus: KanbanStatus) => Promise<{ enqueuedTasks: unknown[] }>;
  updatePriority: (repositoryFullName: string, issueNumber: number, priority: Priority) => Promise<void>;
  addAssignee: (
    repositoryFullName: string,
    issueNumber: number,
    assignee: { assigneeType: 'agent' | 'member'; assigneeAgentId?: string; assigneeMemberId?: string }
  ) => Promise<void>;
  removeAssignee: (repositoryFullName: string, issueNumber: number, assigneeId: string) => Promise<void>;
  updateSquadAssignee: (repositoryFullName: string, issueNumber: number, assigneeSquadId: string | null) => Promise<void>;
  addLabelToIssue: (repositoryFullName: string, issueNumber: number, labelId: string) => Promise<void>;
  removeLabelFromIssue: (repositoryFullName: string, issueNumber: number, labelId: string) => Promise<void>;
  removeFromBoard: (repositoryFullName: string, issueNumber: number) => Promise<void>;
  upsertBoardItem: (item: IssueBoardItem) => void;
  syncFromGitHub: (repositoryFullName: string) => Promise<{ synced: number }>;
  createIssue: (repositoryFullName: string, input: Omit<CreateIssueInput, 'repositoryFullName'>) => Promise<IssueBoardItem>;
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
      return { enqueuedTasks: result.enqueuedTasks };
    } catch (error) {
      console.error('[IssueBoardStateStore] Error moving card:', error);
      // Revert optimistic update by re-fetching is handled by the component
      throw error;
    }
  },

  updatePriority: async (repositoryFullName, issueNumber, priority) => {
    const updated = await issueBoardStateClientService.updatePriority({ repositoryFullName, issueNumber, priority });
    set(
      (s) => ({ boardItems: s.boardItems.map((b) => (b.issueNumber === issueNumber ? updated : b)) }),
      false,
      'updatePriority'
    );
  },

  addAssignee: async (repositoryFullName, issueNumber, assignee) => {
    const updated = await issueBoardStateClientService.addAssignee({ repositoryFullName, issueNumber, ...assignee });
    set(
      (s) => ({ boardItems: s.boardItems.map((b) => (b.issueNumber === issueNumber ? updated : b)) }),
      false,
      'addAssignee'
    );
  },

  removeAssignee: async (repositoryFullName, issueNumber, assigneeId) => {
    const updated = await issueBoardStateClientService.removeAssignee({ repositoryFullName, issueNumber, assigneeId });
    set(
      (s) => ({ boardItems: s.boardItems.map((b) => (b.issueNumber === issueNumber ? updated : b)) }),
      false,
      'removeAssignee'
    );
  },

  updateSquadAssignee: async (repositoryFullName, issueNumber, assigneeSquadId) => {
    const updated = await issueBoardStateClientService.updateSquadAssignee({ repositoryFullName, issueNumber, assigneeSquadId });
    set(
      (s) => ({ boardItems: s.boardItems.map((b) => (b.issueNumber === issueNumber ? updated : b)) }),
      false,
      'updateSquadAssignee'
    );
  },

  addLabelToIssue: async (repositoryFullName, issueNumber, labelId) => {
    const updated = await issueBoardStateClientService.addLabelToIssue({ repositoryFullName, issueNumber, labelId });
    set(
      (s) => ({ boardItems: s.boardItems.map((b) => (b.issueNumber === issueNumber ? updated : b)) }),
      false,
      'addLabelToIssue'
    );
  },

  removeLabelFromIssue: async (repositoryFullName, issueNumber, labelId) => {
    const updated = await issueBoardStateClientService.removeLabelFromIssue({ repositoryFullName, issueNumber, labelId });
    set(
      (s) => ({ boardItems: s.boardItems.map((b) => (b.issueNumber === issueNumber ? updated : b)) }),
      false,
      'removeLabelFromIssue'
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

  createIssue: async (repositoryFullName, input) => {
    const item = await issueBoardStateClientService.createIssue({ repositoryFullName, ...input });
    set(
      (s) => ({ boardItems: [...s.boardItems, item] }),
      false,
      'createIssue'
    );
    return item;
  },
});
