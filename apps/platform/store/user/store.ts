import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '@/store/middleware/createDevTools';
import { UserStoreState, initialState } from './initialState';
import { UserAction, createUserSlice } from './slices/user/action';

export type UserStore = UserStoreState & UserAction;

const createStore: StateCreator<UserStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createUserSlice(...parameters),
});

const devtools = createDevtools('user');

export const useUserStore = createWithEqualityFn<UserStore>()(
  devtools(createStore),
  shallow,
);
