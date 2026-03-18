---
name: platform-project-structure
description: Complete project structure and file organization guide for the `apps/platform` Next.js workspace. Use when creating new files, adding features, placing API routes, defining database schemas, or deciding where any new code belongs. Triggers on questions about where to put files, how to name things, or how the platform codebase is organized.
---

# Platform Workspace — Project Structure

`apps/platform` is a **Next.js 14+ App Router** application. Every new file must be placed according to the conventions below. Deviating from these conventions is an architecture violation.

---

## Top-Level Directory Map

```
apps/platform/
│
├── app/                    # Next.js App Router — routes and API handlers
│   ├── (auth)/             # Public auth pages (login, signup)
│   ├── (backend)/          # Server-only: API routes, tRPC handlers, GitHub webhooks
│   │   ├── api/
│   │   │   ├── trpc/       # tRPC HTTP handler
│   │   │   └── upload/     # File upload API routes
│   │   ├── auth/           # Auth callbacks (GitHub OAuth)
│   │   └── github/         # GitHub App webhook handlers
│   └── (platform)/         # Authenticated platform UI pages
│       ├── analytics/
│       ├── architecture/
│       ├── dashboard/
│       ├── installation-success/
│       ├── learn/
│       ├── skills-library/
│       ├── production-grade-projects/
│       ├── repositories/
│       └── subscription/
│
├── components/             # Shared UI components used across the entire platform
│
├── const/                  # App-wide constants (auth, config values)
│
├── database/               # Database layer (Drizzle ORM)
│   ├── core/               # Drizzle client setup
│   ├── migrations/         # SQL migration files
│   ├── models/             # Query models (data access per entity)
│   ├── schemas/            # Drizzle table schema definitions
│   └── type.ts             # Shared database types
│
├── hooks/                  # Shared custom React hooks
│
├── layout/                 # Global React providers / layout wrappers
│   └── GlobalProvider/
│
├── lib/                    # Utility libraries and third-party integrations
│   ├── logger/
│   ├── server/
│   └── trpc/
│
├── server/                 # tRPC router definitions (server-side only)
│   ├── routers/
│   │   └── lambda/         # tRPC lambda routers per entity
│   └── service/            # Server-side service logic (called by routers)
│
├── service/                # Client-side service layer (called by stores/components)
│   ├── chunk/
│   ├── document/
│   ├── installation/
│   └── organization/
│
├── store/                  # Zustand global state stores
│   ├── document/
│   ├── file/
│   ├── middleware/
│   └── organization/
│       ├── index.ts
│       ├── initialState.ts
│       ├── selectors.ts
│       ├── slices/
│       └── store.ts
│
├── types/                  # Shared TypeScript types
│
└── utils/                  # Shared utility functions
    ├── env.ts
    ├── server/
    └── supabase/
```

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| React components | PascalCase | `AppSidebar.tsx`, `LoginForm.tsx` |
| Hooks | camelCase with `use` prefix | `useInstallation.ts`, `useOrganizations.ts` |
| Utility functions / libs | camelCase | `generateGithubAppJwt.ts`, `langgraph-client.ts` |
| Types / interfaces | PascalCase | `InstallationType`, `GraphTypes` |
| Constants | camelCase (config objects), UPPER_SNAKE_CASE (true constants) | `auth.ts` exports `AUTH_COOKIE_NAME` |
| Database schemas | camelCase filename per entity | `organization.ts`, `repository.ts` |
| Database models | camelCase filename per entity | `organization.ts`, `document.ts` |
| tRPC routers | camelCase filename per entity | `organization.ts`, `installation.ts` |
| Store slices | directory per entity, nested `slices/` | `store/organization/slices/organization/` |

---

## Import Path Rules

- Use `@/` for all imports within `apps/platform`:
  ```ts
  import { Button } from '@/components/ui/button'
  import { db } from '@/database/core'
  import { organizationRouter } from '@/server/routers/lambda/organization'
  ```
- Use `@repo/*` for shared monorepo packages:
  ```ts
  import { Editor } from '@repo/editor'
  import { cn } from '@repo/ui'
  ```
- **Never** use relative `../../` paths that escape the workspace root.

---

## Data Flow

```
React UI (app/(platform)/)
  → Zustand Store (store/)
    → Client Service (service/)
      → tRPC lambda (server/routers/lambda/)
        → Server Service (server/service/)
          → Database Model (database/models/)
            → PostgreSQL (Supabase)
```

- **Components** render state from stores and call store actions.
- **Stores** call client services for data fetching and mutations.
- **Client services** (`service/`) make tRPC calls to the backend.
- **tRPC routers** (`server/routers/lambda/`) receive requests, call server services.
- **Server services** (`server/service/`) contain business logic, call database models.
- **Database models** (`database/models/`) execute Drizzle queries against schemas.

---

## Route Groups

| Group | Purpose |
|---|---|
| `app/(auth)/` | Public pages that do not require authentication (login, signup) |
| `app/(backend)/` | Server-only API routes — no UI rendered here |
| `app/(platform)/` | All authenticated platform pages |

- New authenticated pages → `app/(platform)/<feature>/`
- New API routes → `app/(backend)/api/<resource>/route.ts`
- New tRPC handlers → `app/(backend)/api/trpc/`

---

## Database Layer Conventions

```
database/
├── schemas/<entity>.ts     # Drizzle table definition — column names, types, relations
├── models/<entity>.ts      # Query functions — CRUD operations for that entity
├── migrations/             # Auto-generated migration SQL files (do not edit manually)
├── core/                   # Drizzle client instantiation
└── type.ts                 # Shared inferred types from schemas
```

- **One file per entity** in both `schemas/` and `models/`.
- Schema files use Drizzle `pgTable` definitions only — no business logic.
- Model files export plain async functions (e.g. `getOrganizationById`, `createDocument`).
- Never import `database/models/` directly from a React component — always go through `server/service/` via tRPC.

---

## Store Conventions (Zustand)

Each store lives in `store/<entity>/` and has this structure:

```
store/<entity>/
├── index.ts           # Re-exports the store hook
├── initialState.ts    # State interface + default values
├── selectors.ts       # Selector functions for derived state
├── slices/            # Action slices (one subdirectory per slice)
└── store.ts           # createStore combining all slices
```

- Export a single `use<Entity>Store` hook from `index.ts`.
- Keep selectors in `selectors.ts` — never compute derived state inline in components.
- Use **plain arrays** for list data (`xxxList: XxxItem[]`).
- Use **Record maps** for detail data (`xxxMap: Record<string, Xxx>`).

---

## Component Placement

| Type | Location |
|---|---|
| Shared across multiple pages | `components/` |
| Scoped to a single route/feature | `app/(platform)/<feature>/components/` (co-located) |
| shadcn/ui primitives | `components/ui/` |
| Page-level layout wrappers | `layout/` |
| Analytics/metrics UI | `components/analytics-ui/` |

Do **not** create a new top-level directory for components that already have a home above.

---

## Hooks Conventions

- Shared hooks used in 2+ pages → `hooks/`
- Hooks scoped to one page → co-locate next to the page file
- Always prefix with `use`: `useInstallation.ts`, `useOrganizations.ts`

---

## API Layer Conventions

See `docs/development/api-layer/` for full patterns. Summary:

- All tRPC routers live in `server/routers/lambda/<entity>.ts`
- All routers are registered in `server/routers/lambda/index.ts`
- The HTTP handler that exposes them lives in `app/(backend)/api/trpc/`
- REST-style routes (e.g. file upload, GitHub webhooks) live in `app/(backend)/api/<resource>/route.ts`

---

## Types Conventions

```
types/
├── auth.ts          # Auth-related types
├── asyncTask.ts     # Async task types
├── graphTypes.ts    # Graph / RAG types
├── rag.ts           # RAG-specific types
├── chunk/           # Chunk entity types
├── document/        # Document entity types
└── files/           # File entity types
```

- Entity types live in `types/<entity>.ts` or `types/<entity>/` (directory) when complex.
- Database inferred types (from Drizzle `$inferSelect`) are exported from `database/type.ts`.
- Never use database types directly in components — define separate view/UI types in `types/`.

---

## Utility Libraries (`lib/`)

`lib/` holds integrations with third-party services and app-wide utility modules:

| File/Dir | Purpose |
|---|---|
| `lib/trpc/` | tRPC client setup |
| `lib/logger/` | Structured logging |
| `lib/server/` | Server-only utilities |
| `lib/langgraph-client.ts` | LangGraph client (browser-safe) |
| `lib/langgraph-server.ts` | LangGraph server helper |
| `lib/generate-github-app-jwt.ts` | GitHub App JWT generation |
| `lib/pdf.ts` | PDF processing |
| `lib/slack.ts` | Slack notifications |

Only add to `lib/` when a utility wraps a third-party SDK or is reused across 3+ files.

---

## Configuration Files

| File | Purpose |
|---|---|
| `middleware.ts` | Auth middleware and route protection |
| `drizzle.config.ts` | Drizzle ORM configuration |
| `features.json` | Feature flags |
| `next.config.js` | Next.js configuration |
| `utils/env.ts` | Validated environment variable exports |

Always import env variables through `utils/env.ts` — never use `process.env` directly in application code.

---

## Checklist — Adding a New Feature

When adding a new feature (e.g. "widgets"):

- [ ] Create page at `app/(platform)/widgets/page.tsx`
- [ ] Add tRPC router at `server/routers/lambda/widget.ts`
- [ ] Register router in `server/routers/lambda/index.ts`
- [ ] Add server service at `server/service/widget.ts`
- [ ] Add database schema at `database/schemas/widget.ts`
- [ ] Add database model at `database/models/widget.ts`
- [ ] Add client service at `service/widget/`
- [ ] Add Zustand store at `store/widget/` (if global state is needed)
- [ ] Add types at `types/widget.ts` (or `types/widget/`)
- [ ] Add shared hooks at `hooks/useWidget.ts` (if needed)
- [ ] Use `@/` imports throughout — no relative `../` escaping the workspace

---

## Architecture Rules (Enforced)

1. **No cross-layer imports downward past one step** — components call stores, not services directly.
2. **No direct database imports in components or stores** — always go through `server/service/` via tRPC.
3. **No `process.env` outside `utils/env.ts`**.
4. **No barrel re-exports** from feature directories — import files directly to avoid tree-shaking issues.
5. **Route groups are structural** — `(auth)`, `(backend)`, `(platform)` are not URL segments.
