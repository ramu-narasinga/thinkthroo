import { OrganizationStore } from './store';

export const organizationSelectors = {
  organizations: (s: OrganizationStore) => s.organizations,
  activeOrgId: (s: OrganizationStore) => s.activeOrgId,
  activeOrg: (s: OrganizationStore) =>
    s.organizations.find((org) => org.id === s.activeOrgId),
  isSyncing: (s: OrganizationStore) => s.isSyncing,
  isFirstFetchFinished: (s: OrganizationStore) => s.isOrganizationsFirstFetchFinished,
};
