---
name: platform-api-layer
description: API layer guide for the `apps/platform` workspace. Use when adding new API endpoints, creating tRPC routers, writing client services, or wiring up data fetching from stores or components. Triggers on any task involving API calls, tRPC procedures, server-side data access, or client-side service methods.
---

# Platform — API Layer

The platform uses **tRPC** as its sole API communication layer. There is no plain REST fetch code in components or stores — all data fetching flows through a single pre-configured tRPC client instance.

---

## Architecture Overview

```
Zustand Store Action
  └── service/<entity>/client.ts        (client service — wraps lambdaClient calls)
        └── lib/trpc/client/lambda.ts   (single tRPC client instance → /api/trpc/lambda)
              └── app/(backend)/api/trpc/lambda/route.ts  (Next.js route handler)
                    └── server/routers/lambda/<entity>.ts  (tRPC router per entity)
                          └── server/service/<entity>/     (server-side business logic)
                                └── database/models/<entity>.ts  (Drizzle ORM queries)
```

---

## 1. The Single tRPC Client Instance

There is **one** pre-configured tRPC client, created in `lib/trpc/client/lambda.ts`. Never create additional tRPC client instances elsewhere.

```typescript
// lib/trpc/client/lambda.ts
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { LambdaRouter } from "@/server/routers/lambda";

const customHttpBatchLink = httpBatchLink({
  url: `/api/trpc/lambda`,
  transformer: superjson,
  maxURLLength: 2083,
  // headers, fetch overrides go here
});

// Vanilla client — used in services and Zustand stores
export const lambdaClient = createTRPCClient<LambdaRouter>({ links: [customHttpBatchLink] });

// React-Query client — used in React components with hooks
export const lambdaQuery = createTRPCReact<LambdaRouter>();
export const lambdaQueryClient = lambdaQuery.createClient({ links: [customHttpBatchLink] });
```

**Import rule:** Always import from `@/lib/trpc/client`:

```typescript
import { lambdaClient } from '@/lib/trpc/client/lambda';
```

---

## 2. tRPC Router Definition

Each entity gets its own router file under `server/routers/lambda/<entity>.ts`. All routers are combined in `server/routers/lambda/index.ts` into the root `lambdaRouter`.

### Router file pattern

```typescript
// server/routers/lambda/organization.ts
import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { OrganizationModel } from '@/database/models/organization';
import { OrganizationService } from '@/server/service/organization';

// Compose a procedure with middleware that attaches DB and service to ctx
const organizationProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        organizationModel: new OrganizationModel(ctx.serverDB, ctx.userId),
        organizationService: new OrganizationService(ctx.serverDB, ctx.userId),
      },
    });
  });

export const organizationRouter = router({
  // Queries — read operations
  getAll: organizationProcedure.query(async ({ ctx }) => {
    return ctx.organizationService.getAll();
  }),

  getById: organizationProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.organizationService.getById(input.id);
    }),

  // Mutations — write operations
  syncFromGitHub: organizationProcedure
    .input(z.object({ accessToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.organizationService.syncFromGitHub(input.accessToken);
    }),

  delete: organizationProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.organizationService.delete(input.id);
    }),
});
```

### Registering a new router

Add every new entity router to `server/routers/lambda/index.ts`:

```typescript
// server/routers/lambda/index.ts
import { router } from '@/lib/trpc/lambda';
import { organizationRouter } from './organization';
import { installationRouter } from './installation';
// ... other routers

export const lambdaRouter = router({
  organization: organizationRouter,
  installation: installationRouter,
  // new entity: entityRouter,
});

export type LambdaRouter = typeof lambdaRouter;
```

---

## 3. Client Service

The client service wraps `lambdaClient` calls into a typed class. It lives in `service/<entity>/client.ts` and is exported as a **singleton**. Stores and components import the singleton — they never call `lambdaClient` directly.

```typescript
// service/organization/client.ts
import { lambdaClient } from '@/lib/trpc/client/lambda';
import { OrganizationItem } from '@/store/organization/initialState';

export class OrganizationClientService {
  getAll = async (): Promise<OrganizationItem[]> => {
    const result = await lambdaClient.organization.getAll.query();
    return result.map((org) => ({
      id: org.id,
      githubOrgId: org.githubOrgId,
      login: org.login ?? undefined,
      // map other nullable fields to undefined as needed
    }));
  };

  syncFromGitHub = async (accessToken: string): Promise<void> => {
    await lambdaClient.organization.syncFromGitHub.mutate({ accessToken });
  };

  getById = async (id: string) => {
    return lambdaClient.organization.getById.query({ id });
  };

  delete = async (id: string) => {
    return lambdaClient.organization.delete.mutate({ id });
  };
}

// Export singleton — always import this, not the class directly
export const organizationClientService = new OrganizationClientService();
```

`service/<entity>/index.ts` re-exports from `client.ts`:

```typescript
// service/organization/index.ts
export * from "./client";
```

---

## 4. Consuming the Client Service from a Zustand Store

Store actions call the client service singleton and update state:

```typescript
// store/organization/slices/organization/action.ts
import { organizationClientService } from '@/service/organization';

fetchOrganizations: async () => {
  const organizations = await organizationClientService.getAll();
  get().internal_updateOrganizations(organizations);
},

syncFromGitHub: async () => {
  const token = await getSupabaseAccessToken();
  await organizationClientService.syncFromGitHub(token);
  await get().fetchOrganizations();
},
```

---

## 5. Using tRPC React-Query Hooks in Components

For data fetching directly in React components (where React-Query is preferred over Zustand), use `lambdaQuery`:

```typescript
"use client"
import { lambdaQuery } from '@/lib/trpc/client/lambda';

export function OrganizationList() {
  const { data, isLoading } = lambdaQuery.organization.getAll.useQuery();
  // ...
}
```

---

## 6. Procedure Types

| Procedure type | When to use | tRPC method |
|---|---|---|
| `authedProcedure` | Any endpoint requiring a logged-in user | base for all entity procedures |
| `publicProcedure` | Endpoints that do not require auth (rare) | standalone use |
| `.query()` | Read-only data fetching | `lambdaClient.<router>.<proc>.query()` |
| `.mutation()` | Create, update, delete operations | `lambdaClient.<router>.<proc>.mutate()` |

Always use `authedProcedure` from `@/lib/trpc/lambda` for any endpoint that accesses user data. Never use `publicProcedure` for protected resources.

---

## 7. Input Validation

All procedure inputs **must** be validated with `zod`. Define schemas inline or import from `types/`:

```typescript
import { z } from 'zod';

.input(z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
}))
```

---

## 8. File & Naming Conventions

| Artifact | Location | Naming |
|---|---|---|
| tRPC router | `server/routers/lambda/<entity>.ts` | `organizationRouter`, `installationRouter` |
| Root router | `server/routers/lambda/index.ts` | `lambdaRouter` |
| Server-side service | `server/service/<entity>/` | `OrganizationService` class |
| Client service file | `service/<entity>/client.ts` | `OrganizationClientService` class |
| Client service singleton | `service/<entity>/client.ts` | `organizationClientService` |
| tRPC client setup | `lib/trpc/client/lambda.ts` | `lambdaClient`, `lambdaQuery` |
| tRPC server init | `lib/trpc/lambda/init.ts` | `trpc` (internal only) |
| tRPC server exports | `lib/trpc/lambda/index.ts` | `router`, `authedProcedure`, `publicProcedure` |

---

## 9. Checklist for Adding a New Entity Endpoint

1. **Server service** — add logic in `server/service/<entity>/`
2. **Database model** — add query in `database/models/<entity>.ts`
3. **tRPC router** — create `server/routers/lambda/<entity>.ts` with procedures
4. **Register router** — add to `server/routers/lambda/index.ts`
5. **Client service** — add method in `service/<entity>/client.ts` wrapping `lambdaClient`
6. **Store action** — call client service from `store/<entity>/slices/<entity>/action.ts`

Do **not** call `lambdaClient` directly from components or pages. Always go through the client service singleton.
