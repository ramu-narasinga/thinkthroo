import { FileListItem, QueryFileListParams } from '@/types/files';

export interface FileManagerState {
  fileDetail?: FileListItem;
  fileList: FileListItem[];
  queryListParams?: QueryFileListParams;
}

export const initialFileManagerState: FileManagerState = {
  fileList: [],
};