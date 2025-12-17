# API Layer: Get Organizations

## Architecture Pattern
```
Component → Hook → Store (Zustand) → Client Service → tRPC Client → Router → Server Service → Model → Database
```

## Files

| Layer | File | Responsibility |
|-------|------|----------------|
| Component | `components/org-switcher.tsx` | UI, user interactions |
| Hook | `hooks/useOrganizations.ts` | Bridge component to store, trigger fetch on mount |
| Store | `store/organization/slices/organization/action.ts` | Client state (Zustand), orchestrate data flow |
| Client Service | `service/organization/client.ts` | Wraps tRPC calls, handles type transformations |
| tRPC Client | `lib/trpc/client/lambda.ts` | Type-safe HTTP client |
| Router | `server/routers/lambda/organization.ts` | Auth, validate, delegate |
| Server Service | `server/service/organization/index.ts` | Business logic, GitHub API, data transform |
| Model | `database/models/organization.ts` | Database queries (Drizzle ORM) |
| Database | `organizations` table | PostgreSQL + RLS |

## Code Examples

### Component
```typescript
'use client';
export function OrgSwitcher() {
  const { organizations, activeOrg, setActiveOrg, syncFromGitHub } = useOrganizations();
  // Render dropdown, handle selection
}
```

### Hook
```typescript
export const useOrganizations = () => {
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations);
  const syncFromGitHub = useOrganizationStore((s) => s.syncFromGitHub);
  const setActiveOrg = useOrganizationStore((s) => s.setActiveOrg);
  
  const organizations = useOrganizationStore(organizationSelectors.organizations);
  const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
  const isSyncing = useOrganizationStore(organizationSelectors.isSyncing);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations,
    activeOrg,
    isSyncing,
    setActiveOrg,
    syncFromGitHub,
    refetch: fetchOrganizations,
  };
};
```

### Store (Zustand)
```typescript
// store/organization/slices/organization/action.ts
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
```

### Client Service
```typescript
// service/organization/client.ts
export class OrganizationClientService {
  /**
   * Get all organizations for the current user from database
   */
  getAll = async (): Promise<OrganizationItem[]> => {
    const result = await lambdaClient.organization.getAll.query();
    
    // Map null to undefined to match OrganizationItem type
    return result.map((org) => ({
      id: org.id,
      githubOrgId: org.githubOrgId,
      login: org.login ?? undefined,
      avatarUrl: org.avatarUrl ?? undefined,
      description: org.description ?? undefined,
      apiUrl: org.apiUrl ?? undefined,
      reposUrl: org.reposUrl ?? undefined,
      lastFetched: org.lastFetched ?? undefined,
    }));
  };

  /**
   * Sync organizations from GitHub to database
   */
  syncFromGitHub = async (accessToken: string): Promise<void> => {
    await lambdaClient.organization.syncFromGitHub.mutate({
      accessToken,
    });
  };

  /**
   * Get organization by ID
   */
  getById = async (id: string) => {
    return lambdaClient.organization.getById.query({ id });
  };
}

export const organizationClientService = new OrganizationClientService();

// service/organization/index.ts
export * from "./client";
```

### Router
```typescript
export const organizationRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return new OrganizationService(ctx.db).getAll(ctx.user.id);
  }),
  
  syncFromGitHub: protectedProcedure.mutation(async ({ ctx }) => {
    return new OrganizationService(ctx.db).syncFromGitHub(ctx.user.id);
  }),
});
```

### Service
```typescript
// server/service/organization/index.ts
export class OrganizationService {
  private userId: string;
  private db: ThinkThrooDatabase;
  private organizationModel: OrganizationModel;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.organizationModel = new OrganizationModel(db, userId);
  }

  async getAll() {
    return this.organizationModel.findAll();
  }

  async syncFromGitHub(accessToken: string) {
    // 1. Fetch from GitHub API
    const response = await fetch('https://api.github.com/user/orgs', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const orgs: GitHubOrganization[] = await response.json();

    // 2. Map to database format
    const mappedOrgs = orgs.map((org) => ({
      githubOrgId: org.id.toString(),
      login: org.login,
      avatarUrl: org.avatar_url,
      description: org.description,
      apiUrl: org.url,
      reposUrl: org.repos_url,
      userId: this.userId,
      lastFetched: new Date().toISOString(),
    }));

    // 3. Bulk upsert into database
    return this.organizationModel.bulkUpsert(mappedOrgs);
  }
}
```

### Model
```typescript
export class OrganizationModel {
  async findAll(userId: string) {
    return this.db.select().from(organizations).where(eq(organizations.userId, userId));
  }

  async bulkUpsert(orgs: InsertOrganization[]) {
    return this.db.insert(organizations).values(orgs)
      .onConflictDoUpdate({
        target: [organizations.githubOrgId, organizations.userId],
        set: { name: sql`EXCLUDED.name`, avatarUrl: sql`EXCLUDED.avatar_url` },
      });
  }
}
```

### Database
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  github_org_id TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT
);

CREATE POLICY "Users can view own orgs" ON organizations 
FOR SELECT USING (auth.uid() = user_id);
```

## Data Flow

**Fetch from DB:**
```
Component 
  → Hook (useOrganizations) 
  → Store.fetchOrganizations() 
  → organizationClientService.getAll() 
  → lambdaClient.organization.getAll.query() 
  → Router (auth) 
  → OrganizationService.getAll() 
  → OrganizationModel.findAll() 
  → Database 
  → Response flows back with type transformation in client service
```

**Sync from GitHub:**
```
User clicks "Sync" 
  → Store.syncFromGitHub() 
  → Get Supabase session token
  → organizationClientService.syncFromGitHub(token)
  → lambdaClient.organization.syncFromGitHub.mutate()
  → Router (auth) 
  → OrganizationService.syncFromGitHub() 
  → GitHub API 
  → OrganizationModel.bulkUpsert() 
  → Database
  → Store.fetchOrganizations() to refresh
  → Response flows back 
  → Store updates 
  → Component re-renders
```

## Key Patterns

**Service Layer Separation:**
- **Client Service** (`service/organization/client.ts`): Wraps tRPC calls, runs in browser
- **Server Service** (`server/service/organization/index.ts`): Business logic, runs on server

**Client Service Benefits:**
- Abstracts tRPC client calls from store
- Handles type transformations (null → undefined)
- Single source of truth for API calls
- Easier to test and mock
- Follows LobeChat architecture pattern

**Zustand Store Structure:**
```
store/organization/
  store.ts                      # Main store with devtools
  slices/
    organization/
      action.ts                 # Action implementations
      index.ts                  # Export slice
  selectors.ts                  # Derived state
  initialState.ts               # Default values
```

**Protected Procedures:** All routes use `protectedProcedure` (JWT validation)

**Bulk Upsert:** Use `onConflictDoUpdate` to handle duplicates

**Service Orchestration:** 
- Server Service coordinates: GitHub API → Transform → Model → Database
- Client Service coordinates: Store → tRPC → Type transformation

**Type Transformation:** Client service maps database types (null) to store types (undefined)

## Security
- JWT authentication (`protectedProcedure`)
- RLS policies (user-level isolation)
- User ID from JWT token (trusted source)
- GitHub OAuth token (scoped permissions)

## Types
```typescript
// Store types
interface OrganizationItem {
  id: string;
  githubOrgId: string;
  login?: string;          // undefined instead of null
  avatarUrl?: string;
  description?: string;
  apiUrl?: string;
  reposUrl?: string;
  lastFetched?: string;
}

interface OrganizationStoreState {
  organizations: OrganizationItem[];
  activeOrgId?: string;
  isSyncing: boolean;
  isOrganizationsFirstFetchFinished: boolean;
}

interface OrganizationAction {
  setActiveOrg: (orgId: string) => void;
  fetchOrganizations: () => Promise<void>;
  syncFromGitHub: () => Promise<void>;
  internal_updateOrganizations: (organizations: OrganizationItem[]) => void;
}

// GitHub API types
interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url: string;
  description?: string;
  url: string;
  repos_url: string;
}
```
