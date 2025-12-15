import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { DocumentStoreState, initialState } from './initialState';
import { DocumentAction, createDocumentSlice } from './slices/document/action';

//  =============== createStoreFn ============ //

export type DocumentStore = DocumentStoreState & DocumentAction;

const createStore: StateCreator<DocumentStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createDocumentSlice(...parameters),
});

//  =============== useStore ============ //
const devtools = createDevtools('document');

export const useDocumentStore = createWithEqualityFn<DocumentStore>()(
  devtools(createStore),
  shallow
);

export const getDocumentStoreState = () => useDocumentStore.getState();
