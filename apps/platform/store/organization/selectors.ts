import { OrganizationStore } from './store';

export const organizationSelectors = {
  organizations: (s: OrganizationStore) => s.organizations,
  activeOrgId: (s: OrganizationStore) => s.activeOrgId,
  activeOrg: (s: OrganizationStore) =>
    s.organizations.find((org) => org.id === s.activeOrgId),
  isSyncing: (s: OrganizationStore) => s.isSyncing,
  isFirstFetchFinished: (s: OrganizationStore) => s.isOrganizationsFirstFetchFinished,
  creditBalance: (s: OrganizationStore) => {
    const org = s.organizations.find((o) => o.id === s.activeOrgId);
    return Number(org?.creditBalance ?? '0');
  },
  currentPlanName: (s: OrganizationStore) => {
    const org = s.organizations.find((o) => o.id === s.activeOrgId);
    return org?.currentPlanName ?? 'free';
  },
  isPro: (s: OrganizationStore) => {
    const org = s.organizations.find((o) => o.id === s.activeOrgId);
    return (org?.currentPlanName ?? 'free') === 'pro';
  },
};
