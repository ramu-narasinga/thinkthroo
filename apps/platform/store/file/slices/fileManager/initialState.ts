import { FileListItem, QueryFileListParams } from '@/types/files';

export interface FileManagerState {
  creatingChunkingTaskIds: string[];
  creatingEmbeddingTaskIds: string[];
  fileDetail?: FileListItem;
  fileList: FileListItem[];
  queryListParams?: QueryFileListParams;
  /** Maps documentId -> number of chunks after indexing completes */
  chunkCounts: Record<string, number>;
}

export const initialFileManagerState: FileManagerState = {
  creatingChunkingTaskIds: [],
  creatingEmbeddingTaskIds: [],
  fileList: [],
  chunkCounts: {},
};