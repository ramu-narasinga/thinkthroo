---
name: platform-performance
description: Performance guide for the `apps/platform` workspace. Use when optimising re-renders, splitting code, lazy-loading components or images, memoising expensive computations, deferring saves with debounce, or monitoring web vitals. Triggers on any task involving React performance, loading speed, bundle size, or rendering efficiency.
---

# Platform — Performance

---

## 1. Code Splitting with `next/dynamic`

Next.js App Router supports lazy loading for heavy client components via `next/dynamic`. Use it for rich editors, large third-party widgets, or anything not needed on initial render.

```tsx
import dynamic from "next/dynamic"

// Lazy-load the rich text editor — avoids pulling the heavy bundle on first paint
const EditorPanel = dynamic(
  () => import("@/app/(platform)/repositories/[repository]/architecture/components/EditorPanel"),
  {
    ssr: false,          // editor relies on browser APIs
    loading: () => <p className="text-muted-foreground text-sm">Loading editor…</p>,
  }
)
```

**Rules:**
- Always provide a `loading` fallback so the UI does not blank out.
- Set `ssr: false` for components that depend on `window`, `document`, or browser-only libraries (e.g. `highlight.js`, rich text editors).
- Do **not** dynamically import small/cheap components — the extra network round-trip costs more than it saves.
- Prefer splitting at the **route segment** level first; only go finer-grained when profiling shows a bottleneck.

---

## 2. Component Memoisation

### `React.memo` — prevent entire component re-renders

Wrap a component with `memo` when its parent re-renders frequently but its own props rarely change.

```tsx
// app/(platform)/repositories/(list)/features/RepositoriesListPage.tsx
import { memo } from "react"

const RepositoriesListPage = memo(() => {
  // component body
})

export default RepositoriesListPage
```

**When to use `memo`:**
- The component is expensive to render (large tables, complex layouts).
- Its parent re-renders often for reasons unrelated to this component's props.
- Props are primitive values or stable references.

**When NOT to use `memo`:**
- The component is cheap and renders infrequently — `memo` itself has a cost.
- Props include inline objects/arrays/functions that are recreated on every render (stabilise the references first with `useMemo`/`useCallback`).

---

### `useMemo` — memoise expensive derived values

Use `useMemo` when a computation is expensive **and** its inputs change less often than the component re-renders.

```tsx
// app/(platform)/repositories/(list)/features/RepositoriesListPage.tsx
const { accessibleRepos, revokedRepos } = useMemo(() => {
  const accessible = repositories.filter((repo) => repo.hasAccess)
  const revoked    = repositories.filter((repo) => !repo.hasAccess)
  return { accessibleRepos: accessible, revokedRepos: revoked }
}, [repositories])
```

**Rules:**
- Dependency arrays must be exhaustive — include every value read inside the callback.
- Do **not** memoise trivial operations (string concatenation, boolean checks). The overhead of `useMemo` will exceed the savings.
- Prefer deriving state from Zustand selectors before reaching for `useMemo`.

---

### `useCallback` — stabilise function references

Stabilise event handlers and callbacks that are passed as props to memoised children or used in `useEffect` / `useMemo` dependency arrays.

```tsx
// app/(platform)/repositories/(list)/features/RepositoriesListPage.tsx
const handleTabChange = useCallback((value: string) => {
  setActiveTab(value as "accessible" | "revoked")
  posthog.capture("repository_tab_switched", { to_tab: value })
}, [activeTab, accessibleRepos.length, revokedRepos.length])
```

**Rules:**
- Pair `useCallback` with `memo` on the child — one without the other provides no benefit.
- Only stabilise functions that are genuinely recreated every render. Functions that are only used inside a single component body do not need `useCallback`.

---

## 3. Debounce Expensive Side-Effects

For operations triggered by fast user input (typing in an editor, search boxes, resize handlers), debounce the side-effect to avoid firing it on every keystroke.

```tsx
// app/(platform)/repositories/[repository]/architecture/components/EditorPanel/index.tsx
import { useDebouncedCallback } from "use-debounce"

const SAVE_DEBOUNCE_TIME = 2000 // ms

const debouncedSave = useDebouncedCallback(async (content: string) => {
  setSaveStatus("Saving…")
  await internal_updateSingleDocument({ id: documentId, content })
  setSaveStatus("Saved")
}, SAVE_DEBOUNCE_TIME)
```

**Rules:**
- Always use `use-debounce` (already in the platform dependencies) — do not roll a manual `setTimeout` ref pattern.
- Store the debounce delay as a named constant (`SAVE_DEBOUNCE_TIME`) so it is easy to tune.
- Cancel pending calls on unmount by calling `.cancel()` in a `useEffect` cleanup when the debounced action mutates server state.

---

## 4. State Optimisations

### Split state by locality

Avoid putting unrelated values in a single `useState`. Separate them so that one update does not re-render consumers of the other.

```tsx
// ✅ Each piece of state is independent
const [activeTab, setActiveTab]     = useState<"accessible" | "revoked">("accessible")
const [isDialogOpen, setDialogOpen] = useState(false)

// ❌ Combining unrelated state forces a re-render on any change
const [uiState, setUiState] = useState({ activeTab: "accessible", isDialogOpen: false })
```

### Lazy state initialiser for expensive defaults

```tsx
// ✅ myExpensiveFn() runs once
const [state, setState] = useState(() => myExpensiveFn())

// ❌ myExpensiveFn() runs on every re-render
const [state, setState] = useState(myExpensiveFn())
```

### Keep state as close to its consumers as possible

If only one section of the UI depends on a piece of state, declare it inside that component. Lifting state unnecessarily to a common parent causes that parent (and all its other children) to re-render on every change.

---

## 5. Zustand Store & Selector Performance

### Use fine-grained selectors — never select the whole store

Each `useStore(selector)` call subscribes only to the slice returned by the selector. Selecting the entire store object causes re-renders on any store mutation.

```tsx
// ✅ Subscribes only to the document that changed
import { documentByIdSelector } from "@/store/document/selectors"
const document = useDocumentStore(documentByIdSelector(documentId))

// ✅ Subscribes only to the single action reference (actions are stable)
const fetchDocumentById = useDocumentStore((s) => s.fetchDocumentById)

// ❌ Re-renders on every store update
const store = useDocumentStore()
```

### Use `useShallow` for object/array slices

When selecting multiple values as an object or array, wrap the selector with `useShallow` to prevent re-renders caused by reference inequality.

```tsx
import { useShallow } from "zustand/react/shallow"

const { repositories, isLoading } = useRepositoryStore(
  useShallow((s) => ({ repositories: s.repositories, isLoading: s.isLoading }))
)
```

### Action selectors do not need `useShallow`

Zustand action functions are stable references. Select them as individual primitive subscriptions.

```tsx
const fetchAll = useRepositoryStore((s) => s.fetchAll)      // ✅ stable
const syncNow  = useRepositoryStore((s) => s.syncFromGitHub) // ✅ stable
```

---

## 6. Server Components First

Next.js App Router renders components as **React Server Components** by default. Server components run only on the server — they have zero client-side JavaScript overhead and do not participate in client re-render cycles.

**Default to server components. Add `"use client"` only when required:**

| Requires `"use client"` | Can stay a server component |
|---|---|
| `useState`, `useReducer`, `useEffect` | Static display, data fetching via `async/await` |
| Event handlers (`onClick`, `onChange`) | Reading from database / external API at render time |
| Browser APIs (`window`, `localStorage`) | Rendering lists, tables, cards with static props |
| Context that requires the client runtime | Layouts, navigation chrome |

```tsx
// ✅ Server component — zero client JS, data fetched at render time
export async function RepositoryCard({ repoId }: { repoId: string }) {
  const repo = await fetchRepository(repoId) // server-only fetch
  return <div className="rounded-lg border p-4">{repo.name}</div>
}
```

---

## 7. `children` Prop to Isolate Re-renders

Passing JSX as `children` creates an isolated VDOM subtree. The parent component's state changes do not force re-renders of the `children` because they are owned by the grandparent.

```tsx
// ❌ PureComponent re-renders whenever `count` changes
const Counter = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>count is {count}</button>
      <PureComponent />
    </div>
  )
}

// ✅ PureComponent is stable — owned by the parent of Counter
const App = () => (
  <Counter>
    <PureComponent />
  </Counter>
)

const Counter = ({ children }: { children: React.ReactNode }) => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>count is {count}</button>
      {children}
    </div>
  )
}
```

Use this pattern for sidebars, layout wrappers, and provider components that own local state but contain expensive subtrees.

---

## 8. Styling — Zero-Runtime CSS

The platform uses **Tailwind CSS** exclusively. Tailwind generates all styles at build time; there is no runtime style injection. Avoid runtime styling solutions (`styled-components`, `emotion`) — they generate CSS on every render and inflate the critical rendering path.

```tsx
// ✅ Zero-runtime — class resolved at build time
<div className="rounded-lg border p-4 text-muted-foreground" />

// ❌ Runtime style injection — avoid
<div style={{ borderRadius: 8, padding: 16 }} />
```

---

## 9. Image Optimisation

Use Next.js `<Image>` from `next/image` instead of a plain `<img>` tag. It automatically:
- Serves modern formats (WebP, AVIF).
- Generates a `srcset` for the client's screen size.
- Lazy-loads images outside the viewport by default.

```tsx
import Image from "next/image"

<Image
  src={user.avatarUrl}
  alt={user.login}
  width={32}
  height={32}
  className="rounded-full"
/>
```

**Rules:**
- Always supply `width` and `height` to prevent layout shift (CLS).
- Use `priority` only for above-the-fold images that affect LCP (e.g. hero images, user avatars in the nav).
- For external domains (GitHub avatar CDN, etc.) add the hostname to `images.remotePatterns` in `next.config.js`.

---

## 10. Web Vitals

Monitor Core Web Vitals via [Lighthouse](https://web.dev/measure/) and [Pagespeed Insights](https://pagespeed.web.dev/). Key targets:

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5 s |
| CLS (Cumulative Layout Shift) | ≤ 0.1 |
| INP (Interaction to Next Paint) | ≤ 200 ms |
| FCP (First Contentful Paint) | ≤ 1.8 s |

**Common causes of poor scores in this codebase:**
- Large client bundles from heavy third-party libs (editor, syntax highlighter) — fix with `next/dynamic`.
- Images without explicit dimensions — fix by always supplying `width`/`height` to `<Image>`.
- Expensive synchronous work in global store initialisers — defer with `useEffect`.
- Selecting the entire Zustand store — fix with fine-grained selectors.
