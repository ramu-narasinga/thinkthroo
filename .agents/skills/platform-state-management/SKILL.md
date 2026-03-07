---
name: platform-state-management
description: State management guide for the `apps/platform` workspace using Zustand. Use when creating new stores, adding state slices, writing store actions, selecting state in components, or wiring up data fetching from the API layer into global state. Triggers on any task involving Zustand stores, global state, store actions, selectors, or hooks that read from stores.
---

# Platform — State Management

The platform uses **Zustand** for all global client state. Every store follows the same structure: initial state → slices (actions) → store composition → selectors → custom hook.

---

## Architecture Overview

```
store/<entity>/
  ├── index.ts          — public exports (store hook + initialState types)
  ├── initialState.ts   — state shape types + default values
  ├── store.ts          — compose store from slices, apply devtools/shallow middleware
  ├── selectors.ts      — typed selector functions
  └── slices/
      └── <entity>/
          └── action.ts — StateCreator with actions (calls client service)
```

Each store is a **self-contained module**. Consumers only ever import from `@/store/<entity>` (the `index.ts`) or `@/store/<entity>/selectors`.

---

## 1. Initial State (`initialState.ts`)

Define the state shape as a TypeScript interface and export the zero-value default object:

```typescript
// store/organization/initialState.ts

export interface OrganizationItem {
  id: string;
  githubOrgId: string;
  login?: string;
  avatarUrl?: string;
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
```

Rules:
- All state properties must have explicit types — no `any`.
- Use `undefined` (not `null`) for optional values.
- `isSyncing` / `is<Entity>FirstFetchFinished` are standard loading-state flags.

---

## 2. Slice / Actions (`slices/<entity>/action.ts`)

Each slice is a **`StateCreator`** function that returns an object of action methods. Actions are the only place that call client services.

```typescript
// store/organization/slices/organization/action.ts
import { StateCreator } from 'zustand/vanilla';
import { OrganizationStore } from '../../store';
import { OrganizationItem } from '../../initialState';
import { organizationClientService } from '@/service/organization';

export interface OrganizationAction {
  setActiveOrg: (orgId: string) => void;
  fetchOrganizations: () => Promise<void>;
  syncFromGitHub: () => Promise<void>;
  /** Internal helpers are prefixed with internal_ */
  internal_updateOrganizations: (organizations: OrganizationItem[]) => void;
}

export const createOrganizationSlice: StateCreator<
  OrganizationStore,                    // full store type
  [['zustand/devtools', never]],        // middleware constraint
  [],
  OrganizationAction                    // this slice's action type
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

      set({ isOrganizationsFirstFetchFinished: true }, false, 'fetchOrganizations/success');
    } catch (error) {
      console.error('[OrganizationStore] Error fetching organizations:', error);
    }
  },

  syncFromGitHub: async () => {
    set({ isSyncing: true }, false, 'syncFromGitHub/start');
    try {
      // fetch auth token when needed (not stored in state)
      const token = await getSupabaseAccessToken();
      await organizationClientService.syncFromGitHub(token);
      await get().fetchOrganizations();
      set({ isSyncing: false }, false, 'syncFromGitHub/success');
    } catch (error) {
      console.error('[OrganizationStore] Error syncing:', error);
      set({ isSyncing: false }, false, 'syncFromGitHub/error');
    }
  },

  internal_updateOrganizations: (organizations) => {
    set({ organizations }, false, 'internal_updateOrganizations');
  },
});
```

**`set()` call convention:** always pass `false` as the second argument (replace mode off) and a descriptive **action name string** as the third argument for devtools tracing.

**Naming:** Internal-only helpers that should not be called from outside the store are prefixed `internal_`.

---

## 3. Store Composition (`store.ts`)

All slices are spread into a single store created with `createWithEqualityFn` + `shallow` + the custom `createDevtools` middleware:

```typescript
// store/organization/store.ts
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';
import { createDevtools } from '@/store/middleware/createDevTools';
import { OrganizationStoreState, initialState } from './initialState';
import { OrganizationAction, createOrganizationSlice } from './slices/organization/action';

// 1. Combine state + all action interfaces into the store type
export type OrganizationStore = OrganizationStoreState & OrganizationAction;

// 2. Spread initialState + all slices
const createStore: StateCreator<OrganizationStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...initialState,
  ...createOrganizationSlice(...parameters),
  // ...createAnotherSlice(...parameters), — add more slices here
});

// 3. Wrap with devtools (name must match the entity)
const devtools = createDevtools('organization');

export const useOrganizationStore = createWithEqualityFn<OrganizationStore>()(
  devtools(createStore),
  shallow     // ← prevents re-renders when selected value didn't change
);

// Escape hatch for reading store state outside React (e.g. in services or event handlers)
export const getOrganizationStoreState = () => useOrganizationStore.getState();
```

When a store has **multiple slices** (e.g. `FileStore`), each slice covers a distinct concern and they are composed together:

```typescript
// store/file/store.ts — multiple slices example
export type FileStore = FilesStoreState & FileManageAction & DocumentAction;

const createStore: StateCreator<FileStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createFileManageSlice(...parameters),
  ...createDocumentSlice(...parameters),
});
```

---

## 4. Selectors (`selectors.ts`)

Define all selectors as a plain object of typed functions. Always import selectors from the selectors file, never write inline selector functions in components.

```typescript
// store/organization/selectors.ts
import { OrganizationStore } from './store';

export const organizationSelectors = {
  organizations:      (s: OrganizationStore) => s.organizations,
  activeOrgId:        (s: OrganizationStore) => s.activeOrgId,
  activeOrg:          (s: OrganizationStore) =>
    s.organizations.find((org) => org.id === s.activeOrgId),
  isSyncing:          (s: OrganizationStore) => s.isSyncing,
  isFirstFetchFinished: (s: OrganizationStore) => s.isOrganizationsFirstFetchFinished,
};
```

Usage in components:

```typescript
import { organizationSelectors } from '@/store/organization/selectors';
import { useOrganizationStore } from '@/store/organization';

const activeOrg = useOrganizationStore(organizationSelectors.activeOrg);
```

---

## 5. Public Exports (`index.ts`)

The `index.ts` only re-exports the store hook and initial state types — never selectors or slices directly:

```typescript
// store/organization/index.ts
export { useOrganizationStore, getOrganizationStoreState } from './store';
export * from './initialState';
```

---

## 6. Custom Hooks (`hooks/use<Entity>.ts`)

Wrap store access in a custom hook that also triggers the initial data fetch via `useEffect`. Components always consume via the hook, not via `useOrganizationStore` directly (unless they need a single specific value).

```typescript
// hooks/useOrganizations.ts
import { useEffect } from 'react';
import { useOrganizationStore } from '@/store/organization';
import { organizationSelectors } from '@/store/organization/selectors';

export const useOrganizations = () => {
  const fetchOrganizations = useOrganizationStore((s) => s.fetchOrganizations);
  const syncFromGitHub     = useOrganizationStore((s) => s.syncFromGitHub);
  const setActiveOrg       = useOrganizationStore((s) => s.setActiveOrg);

  const organizations      = useOrganizationStore(organizationSelectors.organizations);
  const activeOrg          = useOrganizationStore(organizationSelectors.activeOrg);
  const isSyncing          = useOrganizationStore(organizationSelectors.isSyncing);
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
```

---

## 7. DevTools Middleware

The custom `createDevtools` wrapper (`store/middleware/createDevTools.ts`) enables Redux DevTools conditionally:

- In **development**, activate per-store DevTools by adding `?debug=<storeName>` to the URL (e.g. `?debug=organization`).
- Store names in DevTools appear as `CodeArc_organization_DEV`.
- In **production**, DevTools are never shown.

Always pass the entity name (lowercase) to `createDevtools`:

```typescript
const devtools = createDevtools('organization'); // → CodeArc_organization
const devtools = createDevtools('file');         // → CodeArc_file
```

---

## 8. Reading Store State Outside React

Use `getOrganizationStoreState()` (or the equivalent per store) to access state imperatively in non-React contexts (e.g. service functions, event callbacks):

```typescript
import { getOrganizationStoreState } from '@/store/organization';

const { activeOrgId } = getOrganizationStoreState();
```

---

## 9. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Store hook | `use<Entity>Store` | `useOrganizationStore` |
| Store type | `<Entity>Store` | `OrganizationStore` |
| State interface | `<Entity>StoreState` | `OrganizationStoreState` |
| Action interface | `<Entity>Action` | `OrganizationAction` |
| Slice creator | `create<Entity>Slice` | `createOrganizationSlice` |
| Selectors object | `<entity>Selectors` | `organizationSelectors` |
| Custom hook | `use<Entities>` | `useOrganizations` |
| DevTools name | lowercase entity | `'organization'` |
| Internal actions | `internal_<actionName>` | `internal_updateOrganizations` |
| Loading flag | `is<Entity>FirstFetchFinished` | `isOrganizationsFirstFetchFinished` |

---

## 10. Checklist for Adding a New Store

1. **`store/<entity>/initialState.ts`** — define state interface and `initialState` object
2. **`store/<entity>/slices/<entity>/action.ts`** — define action interface and `create<Entity>Slice`
3. **`store/<entity>/store.ts`** — compose store with `createWithEqualityFn`, `createDevtools`, `shallow`
4. **`store/<entity>/selectors.ts`** — define `<entity>Selectors` object
5. **`store/<entity>/index.ts`** — re-export store hook and initial state
6. **`hooks/use<Entity>.ts`** — create custom hook with `useEffect` for initial fetch

Do **not** call `lambdaClient` or tRPC directly from a store action — always go through the client service singleton in `service/<entity>/client.ts`.
