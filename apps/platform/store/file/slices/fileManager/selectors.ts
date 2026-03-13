import { FilesStoreState } from "../../initialState";

const isCreatingFileParseTask = (id: string) => (s: FilesStoreState) =>
  s.creatingChunkingTaskIds.includes(id);

const isCreatingChunkEmbeddingTask = (id: string) => (s: FilesStoreState) =>
  s.creatingEmbeddingTaskIds.includes(id);

const chunkCountSelector = (id: string) => (s: FilesStoreState) =>
  s.chunkCounts[id] ?? 0;

export const fileManagerSelectors = {
  isCreatingChunkEmbeddingTask,
  isCreatingFileParseTask,
  chunkCountSelector,
}