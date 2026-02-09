export interface Organization {
  id: string;
  github_org_id: string;
  login: string;
  avatar_url?: string;
  description?: string;
  api_url?: string;
  repos_url?: string;
  user_id?: string;
  is_personal: boolean;
  credit_balance: string;
  current_plan_name?: string;
  last_fetched?: string;
}