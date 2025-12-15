# API Layer: Process Installation

## Architecture Pattern
```
Component → Hook → tRPC Client → Router → Service → Model → Database + GitHub API
```

**Trigger:** GitHub redirects → `/installation-success?installation_id=12345`

## Files

| Layer | File | Responsibility |
|-------|------|----------------|
| Component | `app/(platform)/installation-success/page.tsx` | Extract URL params, trigger processing, show states |
| Hook | `hooks/useInstallation.ts` | Manage state, call tRPC, handle navigation |
| tRPC Client | `lib/trpc/client/lambda.ts` | Type-safe HTTP client |
| Router | `server/routers/lambda/installation.ts` | Auth, validate inputs (Zod), delegate |
| Service | `service/installation/index.ts` | Orchestrate 5-step flow, GitHub API, transform data |
| Model | `database/models/installation.ts` | Database queries, upsert logic |
| Database | `installations`, `repositories` tables | PostgreSQL + RLS + CASCADE deletes |

## Code Examples

### Component
```typescript
'use client';
export default function InstallationSuccessPage() {
  const searchParams = useSearchParams();
  const installationId = searchParams.get('installation_id');
  const activeOrg = useOrganizationStore((state) => state.activeOrg);
  const { isProcessing, error, result, processInstallation } = useInstallation();

  useEffect(() => {
    if (installationId && activeOrg?.id) {
      processInstallation(installationId, activeOrg.id);
    }
  }, [installationId, activeOrg]);

  // Render: loading → success → error states
}
```

### Hook
```typescript
export const useInstallation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InstallationResult | null>(null);

  const processInstallation = useCallback(async (installationId: string, organizationId: string) => {
    try {
      setIsProcessing(true);
      const data = await lambdaClient.installation.processCallback.mutate({
        installationId, organizationId
      });
      setResult(data);
      setTimeout(() => router.push('/repositories'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processInstallation, isProcessing, error, result };
};
```

### Router
```typescript
export const installationRouter = router({
  processCallback: protectedProcedure
    .input(z.object({
      installationId: z.string(),
      organizationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return new InstallationService(ctx.db).processCallback(input);
    }),
});
```

### Service (5-Step Flow)
```typescript
export class InstallationService {
  async processCallback({ installationId, organizationId }) {
    // Step 1: Fetch installation from GitHub
    const installation = await this.fetchInstallationDetails(installationId);

    // Step 2: Generate installation token
    const token = await this.generateInstallationToken(installationId);

    // Step 3: Fetch repositories from GitHub
    const repositories = await this.fetchInstallationRepositories(token);

    // Step 4: Upsert installation
    await this.installationModel.upsertInstallation({
      githubInstallationId: installationId,
      organizationId,
      userId: installation.account.id.toString(),
    });

    // Step 5: Bulk upsert repositories
    await this.installationModel.bulkUpsertRepositories(
      repositories.map(repo => ({
        githubRepoId: repo.id.toString(),
        name: repo.name,
        fullName: repo.full_name,
        installationId,
      }))
    );

    return { installationId, githubOrgId: installation.account.id.toString(), repoCount: repositories.length };
  }

  private async generateInstallationToken(installationId: string) {
    const jwt = generateGithubAppJwt(); // GitHub App JWT
    const octokit = new Octokit({ auth: jwt });
    const { data } = await octokit.rest.apps.createInstallationAccessToken({
      installation_id: parseInt(installationId),
    });
    return data.token; // Scoped, time-limited token
  }
}
```

### Model
```typescript
export class InstallationModel {
  async upsertInstallation(data) {
    return this.db.insert(installations).values(data)
      .onConflictDoUpdate({
        target: [installations.githubInstallationId],
        set: { organizationId: data.organizationId, updatedAt: sql`NOW()` },
      });
  }

  async bulkUpsertRepositories(repos) {
    return this.db.insert(repositories).values(repos)
      .onConflictDoUpdate({
        target: [repositories.githubRepoId],
        set: { name: sql`EXCLUDED.name`, fullName: sql`EXCLUDED.full_name` },
      });
  }
}
```

### Database
```sql
CREATE TABLE installations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  github_installation_id TEXT UNIQUE,
  organization_id UUID REFERENCES organizations(id)
);

CREATE TABLE repositories (
  id UUID PRIMARY KEY,
  installation_id UUID REFERENCES installations(id) ON DELETE CASCADE,
  github_repo_id TEXT UNIQUE,
  name TEXT,
  full_name TEXT
);

CREATE POLICY "Users can view own installations" ON installations 
FOR SELECT USING (auth.uid() = user_id);
```

## Data Flow

```
GitHub App Installation → Redirect with installation_id
→ Component extracts params + active org ID
→ Hook: processInstallation(installationId, orgId)
→ lambdaClient.installation.processCallback.mutate()
→ Router: validate, auth check
→ Service: 5-step orchestration
  1. Fetch installation (GitHub API)
  2. Generate token (JWT → installation token)
  3. Fetch repositories (GitHub API)
  4. Upsert installation (Database)
  5. Bulk upsert repositories (Database)
→ Return result
→ Hook updates state: success
→ Component shows success → redirects to /repositories
```

## Key Patterns

**Installation Token Flow:**
```typescript
// 1. Generate JWT (GitHub App authentication)
const jwt = generateGithubAppJwt();

// 2. Exchange for installation token (scoped to repos, 1 hour expiry)
const { data } = await octokit.rest.apps.createInstallationAccessToken({
  installation_id: parseInt(installationId)
});
```

**Multi-Step Orchestration:** Service coordinates GitHub API → Auth → Database operations

**Upsert Pattern:** Handle re-installations with `onConflictDoUpdate`

**Cascading Deletes:** When installation deleted, repositories automatically deleted

## Security
- GitHub App JWT (server-side, 10 min expiry)
- Installation token (scoped, 1 hour expiry)
- `protectedProcedure` (JWT validation)
- RLS policies (user-level isolation)
- Zod validation (input schemas)

## Types
```typescript
interface ProcessCallbackParams {
  installationId: string;
  organizationId: string;
}

interface InstallationResult {
  installationId: string;
  githubOrgId: string;
  repoCount: number;
}
```
