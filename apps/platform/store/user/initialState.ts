export interface UserStoreState {
  id?: string;
  email?: string;
  avatarUrl?: string;
  name?: string;
}

export const initialState: UserStoreState = {
  id: undefined,
  email: undefined,
  avatarUrl: undefined,
  name: undefined,
};
