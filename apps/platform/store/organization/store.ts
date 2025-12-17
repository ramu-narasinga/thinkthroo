import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { OrganizationStoreState, initialState } from './initialState';
import { OrganizationAction, createOrganizationSlice } from './slices/organization/action';

//  =============== createStoreFn ============ //

export type OrganizationStore = OrganizationStoreState & OrganizationAction;

const createStore: StateCreator<OrganizationStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createOrganizationSlice(...parameters),
});

//  =============== useStore ============ //
const devtools = createDevtools('organization');

export const useOrganizationStore = createWithEqualityFn<OrganizationStore>()(
  devtools(createStore),
  shallow
);

export const getOrganizationStoreState = () => useOrganizationStore.getState();
