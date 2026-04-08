export interface OrganizationItem {
  id: string;
  githubOrgId: string;
  login?: string;
  avatarUrl?: string;
  description?: string;
  apiUrl?: string;
  reposUrl?: string;
  lastFetched?: string;
  currentPlanName?: string;
  creditBalance?: string;
  paddleCustomerId?: string;
  prsReviewed?: number;
  docStorageUsedMB?: number;
}

export interface OrganizationStoreState {
  organizations: OrganizationItem[];
  activeOrgId?: string;
  isSyncing: boolean;
  isOrganizationsFirstFetchFinished: boolean;
}

export const initialState: OrganizationStoreState = {
  organizations: [],
  activeOrgId: undefined,
  isSyncing: false,
  isOrganizationsFirstFetchFinished: false,
};
