import { FilesStoreState } from "../../initialState";

const isCreatingFileParseTask = (id: string) => (s: FilesStoreState) =>
  s.creatingChunkingTaskIds.includes(id);

const isCreatingChunkEmbeddingTask = (id: string) => (s: FilesStoreState) =>
  s.creatingEmbeddingTaskIds.includes(id);

export const fileManagerSelectors = {
isCreatingChunkEmbeddingTask,
  isCreatingFileParseTask,
}