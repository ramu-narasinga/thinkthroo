import { FileManagerState, initialFileManagerState } from './slices/fileManager';

export type FilesStoreState = FileManagerState;

export const initialState: FilesStoreState = {
  ...initialFileManagerState,
};