import { StateCreator } from "zustand/vanilla";
import { FileStore } from "../../store";
import { ragService } from "@/service/rag";

export interface FileManageAction {
  toggleParsingId: (id: string, loading?: boolean) => void,
  parseFileToChunks: (
    id: string,
    params?: { skipExist?: boolean }
  ) => Promise<void>;
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

      get().toggleParsingId(id);
      await ragService.createParseFileTask(id, params?.skipExist);
      get().toggleParsingId(id, false);
    } catch (e) {
      console.error(e);
    }
  },
  publishFile: async (fileId) => {
    try {
      // await ragService.publishFile(fileId);
      console.log("Need to publish file:", fileId);
      get().parseFileToChunks(fileId, { skipExist: false });
    } catch (e) {
      console.error(e);
    }
  },
});
