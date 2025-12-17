import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { FilesStoreState, initialState } from './initialState';
import { FileManageAction, createFileManageSlice } from './slices/fileManager';
import { createDocumentSlice, DocumentAction } from './slices/documents';

//  =============== createStoreFn ============ //

export type FileStore = FilesStoreState & 
  FileManageAction &
  DocumentAction;

const createStore: StateCreator<FileStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createFileManageSlice(...parameters),
  ...createDocumentSlice(...parameters),
});

//  =============== useStore ============ //
const devtools = createDevtools('file');

export const useFileStore = createWithEqualityFn<FileStore>()(devtools(createStore), shallow);

export const getFileStoreState = () => useFileStore.getState();