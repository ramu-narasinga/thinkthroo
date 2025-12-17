import { useEffect } from 'react';
import { useOrganizationStore } from '@/store/organization';
import { organizationSelectors } from '@/store/organization/selectors';

export const useOrganizations = () => {
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations);
  const syncFromGitHub = useOrganizationStore((s) => s.syncFromGitHub);
  const setActiveOrg = useOrganizationStore((s) => s.setActiveOrg);
  
  const organizations = useOrganizationStore(organizationSelectors.organizations);
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
  const isSyncing = useOrganizationStore(organizationSelectors.isSyncing);
  const isFirstFetchFinished = useOrganizationStore(organizationSelectors.isFirstFetchFinished);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations,
    activeOrg,
    isSyncing,
    isFirstFetchFinished,
    setActiveOrg,
    syncFromGitHub,
    refetch: fetchOrganizations,
  };
};
