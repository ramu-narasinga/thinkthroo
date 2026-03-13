import { StateCreator } from "zustand/vanilla";
import { FileStore } from "../../store";
import { ragService } from "@/service/rag";
import { documentClientService } from "@/service/document";

export interface FileManageAction {
  toggleParsingId: (id: string, loading?: boolean) => void,
  parseFileToChunks: (
    id: string,
    params?: { skipExist?: boolean }
  ) => Promise<void>;
  fetchChunkCount: (fileId: string) => Promise<void>;
  publishFile: (
    fileId: string
  ) => Promise<void>;
}

export const createFileManageSlice: StateCreator<
  FileStore,
  [["zustand/devtools", never]],
  [],
  FileManageAction
> = (set, get) => ({
  toggleParsingId: (id, loading) => {
    set((state) => {
      const nextValue = new Set(state.creatingChunkingTaskIds);

      if (typeof loading === 'undefined') {
        if (nextValue.has(id)) nextValue.delete(id);
        else nextValue.add(id);
      } else {
        if (loading) nextValue.add(id);
        else nextValue.delete(id);
      }

      return { creatingChunkingTaskIds: Array.from(nextValue.values()) };
    });
  },
  parseFileToChunks: async (id, params) => {
    try {
      get().toggleParsingId(id, true);
      await ragService.createParseFileTask(id, params?.skipExist);
      get().toggleParsingId(id, false);
      // Fetch the up-to-date chunk count once indexing completes
      await get().fetchChunkCount(id);
    } catch (e) {
      console.error(e);
      get().toggleParsingId(id, false);
    }
  },
  fetchChunkCount: async (fileId) => {
    try {
      const count = await ragService.getChunkCount(fileId);
      set((state) => ({
        chunkCounts: { ...state.chunkCounts, [fileId]: count },
      }));
    } catch (e) {
      console.error(e);
    }
  },
  publishFile: async (fileId) => {
    try {
      // Mark document as published in the DB
      await documentClientService.update(fileId, { status: 'published' });
      // Trigger chunking / indexing pipeline
      get().parseFileToChunks(fileId, { skipExist: false });
    } catch (e) {
      console.error(e);
    }
  },
});
