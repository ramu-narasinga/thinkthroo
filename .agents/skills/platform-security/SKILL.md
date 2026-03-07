---
name: platform-security
description: Security guide for the `apps/platform` workspace. Use when implementing authentication, protecting routes, guarding tRPC procedures, working with Supabase RLS policies, or using the service-role client. Triggers on any task involving auth, sessions, protected resources, row-level security, or token handling.
---

# Platform — Security

Security is enforced at three layers: **middleware** (route-level), **tRPC procedures** (API-level), and **Supabase RLS** (database-level). All three must be respected when adding a new feature.

---

## 1. Authentication Stack

Authentication is handled entirely by **Supabase Auth** with **GitHub OAuth** as the provider. There are no passwords or JWTs managed manually.

| Concern | Where |
|---|---|
| Session storage | Supabase-managed **cookies** (HttpOnly, set by `@supabase/ssr`) |
| Session refresh | `utils/supabase/middleware.ts` → called by `middleware.ts` on every request |
| Server-side user read | `utils/supabase/server.ts` → `createClient()` → `supabase.auth.getUser()` |
| Client-side user read | `utils/supabase/client.ts` → `createBrowserClient()` → `supabase.auth.getSession()` |
| Auth provider | GitHub OAuth via `supabase.auth.signInWithOAuth({ provider: 'github' })` |

**Tokens are never stored in `localStorage` or application state.** Supabase SSR manages the session exclusively through cookies.

---

## 2. Route Protection — Middleware

`middleware.ts` runs on every request and calls `updateSession()` to refresh the Supabase session cookie. If no valid user is found the request is redirected to `/login`, unless the path is explicitly excluded:

```typescript
// middleware.ts
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

```typescript
// utils/supabase/middleware.ts (simplified)
const { data: { user } } = await supabase.auth.getUser();

if (
  !user &&
  !request.nextUrl.pathname.startsWith("/login") &&
  !request.nextUrl.pathname.startsWith("/signup") &&
  !request.nextUrl.pathname.startsWith("/auth") &&
  !request.nextUrl.pathname.startsWith("/api/github/callback")
) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}
```

**Rules:**
- Do not add route-specific auth checks in `page.tsx` — the middleware handles it globally.
- To make a new path publicly accessible, add a `startsWith` exclusion to the condition in `utils/supabase/middleware.ts`.
- **Never remove `supabase.auth.getUser()`** from the middleware — it is required to keep sessions refreshed.

---

## 3. API Protection — tRPC `authedProcedure`

Every tRPC procedure that accesses user data **must** use `authedProcedure`, not `publicProcedure`. `authedProcedure` enforces authentication via the `userAuth` middleware:

```typescript
// lib/trpc/middleware/userAuth.ts
export const userAuth = trpc.middleware(async (opts) => {
  const { ctx } = opts;

  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: { userId: ctx.userId },  // userId is now non-null in downstream ctx
  });
});
```

```typescript
// lib/trpc/lambda/index.ts
export const authedProcedure = baseProcedure.use(userAuth);
export const publicProcedure  = baseProcedure; // no auth check — use sparingly
```

At request time `createLambdaContext()` resolves the authenticated user from the Supabase session cookie and populates `ctx.userId`. The `userAuth` middleware rejects the request with `UNAUTHORIZED` if `userId` is absent.

**Rules:**
- Always compose entity routers with `authedProcedure`, never `publicProcedure`, unless the endpoint is genuinely public.
- Never read `userId` from the request body or URL parameters — always use `ctx.userId` which has been verified by `userAuth`.

---

## 4. Database Protection — Supabase RLS

Row Level Security (RLS) is enabled on every user-owned table. Policies are defined in `supabase-rls-policies.sql` and enforce that users can only read/write their own data at the database level — independently of application code.

Pattern for all user-owned tables:

```sql
-- Enable RLS
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

-- SELECT: users see only their own rows
CREATE POLICY "Users can view their own installations"
  ON installations FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: users can only insert rows they own
CREATE POLICY "Users can insert their own installations"
  ON installations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE / DELETE follow the same USING pattern
```

For related tables (e.g. `repositories` owned via `installations`), policies use a sub-select:

```sql
CREATE POLICY "Users can view repositories from their installations"
  ON repositories FOR SELECT
  USING (
    installation_id IN (
      SELECT installation_id FROM installations WHERE user_id = auth.uid()
    )
  );
```

**Rules:**
- Every new table that holds user data **must** have RLS enabled and appropriate policies in `supabase-rls-policies.sql`.
- Application-level filtering in queries is not a substitute for RLS — RLS is the authoritative enforcement layer.

---

## 5. Service-Role Client (Admin Access)

`utils/supabase/service-role.ts` exports a Supabase admin client that **bypasses RLS**. Use it only for trusted server-side operations that must act on behalf of the system (e.g. GitHub webhook processing, seeding data).

```typescript
// utils/supabase/service-role.ts
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

**Rules:**
- **Never** use `createServiceRoleClient()` in client components or any code that runs in the browser.
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the client — it does not have the `NEXT_PUBLIC_` prefix for this reason.
- Only call `createServiceRoleClient()` from within `server/service/`, tRPC routers, or `app/(backend)/` API routes.

---

## 6. GitHub OAuth Login Flow

The login flow is a standard OAuth redirect initiated from a Server Action:

```typescript
// app/(auth)/login/actions.ts
"use server";
export async function login() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo gist notifications",
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    Sentry.captureException(error, { tags: { action: "login", provider: "github" } });
    // handle error
  }

  if (data.url) redirect(data.url);
}
```

Supabase handles the OAuth callback at `app/(backend)/auth/callback/` and sets the session cookie. After the session is established the middleware takes over for all subsequent requests.

---

## 7. Supabase Client Selection Guide

| Context | Client to use | Why |
|---|---|---|
| Server Components / Route Handlers / Server Actions | `utils/supabase/server.ts` → `createClient()` | SSR-aware, reads cookies from `next/headers` |
| Middleware | `utils/supabase/middleware.ts` → `createServerClient()` | Uses `NextRequest` cookies, refreshes session |
| Client Components / Browser | `utils/supabase/client.ts` → `createClient()` | `createBrowserClient`, no cookie management |
| Trusted server-only (bypass RLS) | `utils/supabase/service-role.ts` → `createServiceRoleClient()` | Uses service role key, skips RLS |

Never mix these — using the wrong client for a context can silently bypass security or break session management.

---

## 8. Security Checklist for New Features

1. **New route** — is it publicly accessible? If not, verify it falls under the middleware matcher and is not in the exclusion list.
2. **New tRPC procedure** — does it use `authedProcedure`? Does it read `userId` only from `ctx`?
3. **New table** — does it have `ENABLE ROW LEVEL SECURITY` and all four CRUD policies in `supabase-rls-policies.sql`?
4. **Server-only operation** — if it needs to bypass RLS, does it use `createServiceRoleClient()` only from server code?
5. **OAuth scopes** — if new GitHub permissions are needed, add them to `scopes` in the login action.
6. **Secrets** — all private keys must be server-only env vars (no `NEXT_PUBLIC_` prefix).
