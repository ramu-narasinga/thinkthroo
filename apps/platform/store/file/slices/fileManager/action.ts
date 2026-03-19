import { StateCreator } from "zustand/vanilla";
import { FileStore } from "../../store";
import { documentClientService } from "@/service/document";

export interface FileManageAction {
  publishFile: (
    fileId: string
  ) => Promise<void>;
}

export const createFileManageSlice: StateCreator<
  FileStore,
  [["zustand/devtools", never]],
  [],
  FileManageAction
> = (_set, _get) => ({
  publishFile: async (fileId) => {
    try {
      await documentClientService.publish(fileId);
    } catch (e) {
      console.error(e);
    }
  },
});
