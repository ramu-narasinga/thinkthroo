import { FileListItem, QueryFileListParams } from '@/types/files';

export interface FileManagerState {
  creatingChunkingTaskIds: string[];
  creatingEmbeddingTaskIds: string[];
  fileDetail?: FileListItem;
  fileList: FileListItem[];
  queryListParams?: QueryFileListParams;
}

export const initialFileManagerState: FileManagerState = {
  creatingChunkingTaskIds: [],
  creatingEmbeddingTaskIds: [],
  fileList: [],
};