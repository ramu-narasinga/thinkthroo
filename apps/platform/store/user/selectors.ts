import { UserStore } from './store';

export const userSelectors = {
  id: (s: UserStore) => s.id,
  email: (s: UserStore) => s.email,
  avatarUrl: (s: UserStore) => s.avatarUrl,
  name: (s: UserStore) => s.name,
};
