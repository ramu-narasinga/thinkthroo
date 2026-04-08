import { useEffect } from 'react';
import { useUserStore } from '@/store/user';
import { userSelectors } from '@/store/user/selectors';

export const useCurrentUser = () => {
  const fetchCurrentUser = useUserStore((s) => s.fetchCurrentUser);

  const id = useUserStore(userSelectors.id);
  const email = useUserStore(userSelectors.email);
  const avatarUrl = useUserStore(userSelectors.avatarUrl);
  const name = useUserStore(userSelectors.name);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return { id, email, avatarUrl, name };
};
