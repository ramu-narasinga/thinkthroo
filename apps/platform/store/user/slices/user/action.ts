import { StateCreator } from 'zustand/vanilla';
import { createClient } from '@/utils/supabase/client';
import { UserStore } from '../../store';

export interface UserAction {
  /**
   * Fetch the currently authenticated user from Supabase and populate the store
   */
  fetchCurrentUser: () => Promise<void>;
}

export const createUserSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  UserAction
> = (set) => ({
  fetchCurrentUser: async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      set(
        {
          id: user.id,
          email: user.email ?? undefined,
          avatarUrl: user.user_metadata?.avatar_url ?? undefined,
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? undefined,
        },
        false,
        'fetchCurrentUser/success',
      );
    } catch (error) {
      console.error('[UserStore] Error fetching current user:', error);
    }
  },
});
