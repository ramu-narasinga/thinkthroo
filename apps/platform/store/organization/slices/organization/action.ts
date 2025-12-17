import { StateCreator } from 'zustand/vanilla';
import { OrganizationStore } from '../../store';
import { OrganizationItem } from '../../initialState';
import { createClient } from '@/utils/supabase/client';
import { organizationClientService } from '@/service/organization';

export interface OrganizationAction {
  /**
   * Set the active organization
   */
  setActiveOrg: (orgId: string) => void;

  /**
   * Fetch organizations from database
   */
  fetchOrganizations: () => Promise<void>;

  /**
   * Sync organizations from GitHub
   */
  syncFromGitHub: () => Promise<void>;

  /**
   * Internal: update organizations list
   */
  internal_updateOrganizations: (organizations: OrganizationItem[]) => void;
}

export const createOrganizationSlice: StateCreator<
  OrganizationStore,
  [['zustand/devtools', never]],
  [],
  OrganizationAction
> = (set, get) => ({
  setActiveOrg: (orgId) => {
    set({ activeOrgId: orgId }, false, 'setActiveOrg');
  },

  fetchOrganizations: async () => {
    try {
      const organizations = await organizationClientService.getAll();
      
      get().internal_updateOrganizations(organizations);

      if (!get().activeOrgId && organizations.length > 0) {
        get().setActiveOrg(organizations[0].id);
      }

      set(
        { isOrganizationsFirstFetchFinished: true },
        false,
        'fetchOrganizations/success'
      );
    } catch (error) {
      console.error('[OrganizationStore] Error fetching organizations:', error);
    }
  },

  syncFromGitHub: async () => {
    set({ isSyncing: true }, false, 'syncFromGitHub/start');

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        console.error('[OrganizationStore] No access token available');
        set({ isSyncing: false }, false, 'syncFromGitHub/error');
        return;
      }

      // Call service to sync from GitHub
      await organizationClientService.syncFromGitHub(token);

      // Fetch updated list from database
      await get().fetchOrganizations();
      
      set({ isSyncing: false }, false, 'syncFromGitHub/success');
    } catch (error) {
      console.error('[OrganizationStore] Error syncing from GitHub:', error);
      set({ isSyncing: false }, false, 'syncFromGitHub/error');
    }
  },

  internal_updateOrganizations: (organizations) => {
    set({ organizations }, false, 'internal_updateOrganizations');
  },
});
