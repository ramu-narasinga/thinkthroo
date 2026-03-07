---
name: platform-component-structure
description: React component development guide for the `apps/platform` workspace. Use when creating new components, building UI, deciding where to place a component, styling with Tailwind, using @thinkthroo/ui primitives, or working with modals, forms, tables, and navigation. Triggers on any component creation or modification task.
---

# Platform — Component Structure & Best Practices

---

## Component Library

All UI primitives come from the **monorepo-internal** package `@thinkthroo/ui`, which wraps shadcn/ui and is published from `packages/ui/src/components/`.

**Import pattern — always use the path import, never a barrel:**

```tsx
import { Button } from "@thinkthroo/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@thinkthroo/ui/components/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@thinkthroo/ui/components/dialog"
import { Input } from "@thinkthroo/ui/components/input"
import { Switch } from "@thinkthroo/ui/components/switch"
import { Progress } from "@thinkthroo/ui/components/progress"
```

**Available primitives in `@thinkthroo/ui/components/`:**

| Category | Components |
|---|---|
| Layout | `card`, `separator`, `scroll-area`, `sheet` |
| Input | `button`, `input`, `select`, `checkbox`, `switch`, `label` |
| Feedback | `dialog`, `alert-dialog`, `alert`, `sonner` (toast) |
| Display | `badge`, `avatar`, `tooltip`, `code`, `skeleton` |
| Navigation | `breadcrumb`, `tabs`, `dropdown-menu`, `sidebar`, `collapsible`, `command` |
| Data | `table`, `accordion` |
| Overlay | `popover` |
| Progress | `progress` |

**Component selection priority (highest to lowest):**

1. `@thinkthroo/ui/components/*` — always prefer the internal library
2. `components/` in `apps/platform` — shared platform-specific components
3. Build custom only when the primitive does not exist and cannot be adapted

**Never** install new shadcn/ui components individually — add them to `packages/ui/src/components/` instead so they are available across all apps.

---

## Icons

Always use `lucide-react` for icons:

```tsx
import { BookMarked, LayoutDashboard, ChevronRight, type LucideIcon } from "lucide-react"
```

Do **not** use other icon libraries. If an icon is missing from lucide-react, use an inline SVG.

---

## Styling

- Use **Tailwind CSS** utility classes exclusively for all styling.
- Use the `cn()` helper for conditional class merging:

```tsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", condition && "conditional-class", className)} />
```

- Avoid inline `style={{}}` attributes unless absolutely required for dynamic values that cannot be expressed as Tailwind classes (e.g. a precise pixel width computed at runtime).
- Use Tailwind's design token classes for colors (`text-muted-foreground`, `bg-background`, `text-sidebar-primary`, etc.) — never hardcode hex values.
- Dark mode is handled via Tailwind's `dark:` variant (`dark:bg-gray-900`).

---

## Client vs Server Components

Next.js App Router defaults to **React Server Components**. Add `"use client"` only when the component:

- Uses React state (`useState`, `useReducer`)
- Uses React effects (`useEffect`)
- Uses event handlers (`onClick`, `onChange`, etc.)
- Uses browser APIs
- Uses context that requires the client runtime

```tsx
// ✅ Client component — needs state and event handlers
"use client"

import { useState } from "react"

export function BuyCreditsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [credits, setCredits] = useState(25)
  // ...
}
```

```tsx
// ✅ Server component — pure display, no interactivity
export function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
```

---

## Naming Conventions

| Rule | Convention | Example |
|---|---|---|
| Component files | PascalCase | `AppSidebar.tsx`, `LoginForm.tsx` |
| Exported component name | PascalCase, matches filename | `export function AppSidebar` |
| Default exports | Allowed for modals/pages | `export default function DeleteOrganizationModal` |
| Named exports | **Preferred** for shared components | `export function NavMain` |
| Prop types | Inline or `type Props = {...}` | `type Props = { open: boolean; onClose: () => void }` |

---

## Where to Place Components

### Shared across multiple pages → `components/`

```
components/
├── app-sidebar.tsx          # App-wide sidebar
├── nav-main.tsx             # Navigation
├── nav-user.tsx
├── org-switcher.tsx
├── buy-credits-modal.tsx    # Reusable modal
├── login-form.tsx           # Auth form used in auth pages
├── theme-provider.tsx       # Global provider component
├── analytics-ui/            # Analytics-specific shared components
│   └── table.tsx
├── metrics/                 # Metrics dashboard components
│   ├── index.tsx
│   └── umami.tsx
└── subscription-table/      # Subscription feature UI
    ├── columns.tsx
    └── data-table.tsx
```

**Rule:** A component belongs in `components/` if it is used by 2 or more pages, or if it is part of the global chrome (sidebar, nav, header, footer).

**Rule:** Group related components into a subdirectory under `components/` when there are 2+ components serving the same feature domain (e.g. `analytics-ui/`, `metrics/`, `subscription-table/`).

### Scoped to a single page → co-locate next to the page

```
app/(platform)/repositories/
├── page.tsx
├── (list)/
│   └── page.tsx
└── [repository]/
    ├── page.tsx
    ├── layout.tsx
    ├── architecture/        # Feature-specific sub-pages
    ├── general/
    ├── reviews/
    └── templates/
```

If a component is only ever needed by one route, define it in that route's directory. Only promote it to `components/` when a second page needs it.

---

## Component Patterns

### Modal Pattern

Use `Dialog` from `@thinkthroo/ui/components/dialog` for all modals. Accept `open` and `onOpenChange` as props:

```tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@thinkthroo/ui/components/dialog"
import { Button } from "@thinkthroo/ui/components/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfirmModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
        </DialogHeader>
        {/* content */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

Only fall back to the custom fixed-overlay pattern (`fixed inset-0 z-50`) if Dialog does not fit the use case.

---

### Form Pattern

Use server actions for forms where possible (no `"use client"` needed):

```tsx
// Server component form
import { login } from "@/app/(auth)/login/actions"

export function LoginForm() {
  return (
    <form>
      <Button type="submit" formAction={login}>Login with GitHub</Button>
    </form>
  )
}
```

For client-controlled forms with validation or dynamic behavior, add `"use client"` and use `useState`:

```tsx
"use client"

import { useState } from "react"
import { Input } from "@thinkthroo/ui/components/input"
import { Button } from "@thinkthroo/ui/components/button"

export function EditNameForm() {
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // call tRPC or server action
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <Button type="submit">Save</Button>
    </form>
  )
}
```

---

### Data Table Pattern

Tables are composed of separate `columns.tsx` and `data-table.tsx` files, grouped in a subdirectory:

```
components/subscription-table/
├── columns.tsx     # Column definitions (ColumnDef[])
└── data-table.tsx  # DataTable component using @tanstack/react-table
```

Shared table utilities live at the `components/` root level:
- `data-table-column-header.tsx` — sortable column header
- `data-table-pagination.tsx` — pagination controls
- `data-table-viewoptions.tsx` — column visibility toggle

---

### Navigation Component Pattern

Navigation components accept typed item arrays as props — never hardcode nav items inside the component:

```tsx
export function NavMain({ items }: { items: NavItem[] }) {
  // render from props
}
```

Hardcoded nav data lives in the parent (`app-sidebar.tsx` or a `const/` file), not inside the nav component itself.

---

### Analytics / Tracking

Use the `useUmamiTracking` hook for Umami events and call `posthog.capture()` for PostHog:

```tsx
"use client"

import { useUmamiTracking } from "@/hooks/useUmamiTracking"
import posthog from "posthog-js"

export function SomeButton() {
  const { trackEvent } = useUmamiTracking()

  const handleClick = () => {
    trackEvent("button_clicked", { context: "example" })
    posthog.capture("button_clicked", { context: "example" })
  }

  return <Button onClick={handleClick}>Click me</Button>
}
```

---

## Composition Over Configuration

Avoid components that accept too many props. When a component needs more than ~5 props, split into smaller components or use composition via `children`:

```tsx
// ❌ Too many unrelated props
<PageHeader title="..." subtitle="..." icon={...} actionLabel="..." onAction={...} badge="..." />

// ✅ Compose instead
<PageHeader>
  <PageHeaderTitle>...</PageHeaderTitle>
  <PageHeaderActions>
    <Button>...</Button>
  </PageHeaderActions>
</PageHeader>
```

---

## Anti-Patterns to Avoid

❌ **Nested render functions** — extract into a separate named component instead:

```tsx
// ❌ Wrong
function Page() {
  function renderList() { return <ul>...</ul> }
  return <div>{renderList()}</div>
}

// ✅ Correct
function ItemList() { return <ul>...</ul> }
function Page() { return <div><ItemList /></div> }
```

❌ **Importing from `packages/ui` directly** — always use the `@thinkthroo/ui` alias:

```tsx
// ❌ Wrong
import { Button } from "../../packages/ui/src/components/button"

// ✅ Correct
import { Button } from "@thinkthroo/ui/components/button"
```

❌ **Using `style={{}}` for layout** — use Tailwind:

```tsx
// ❌ Wrong
<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

// ✅ Correct
<div className="flex items-center gap-2">
```

❌ **Placing a component only used on one page in `components/`** — co-locate it with the page instead.

❌ **Hardcoding color values** — use Tailwind design tokens:

```tsx
// ❌ Wrong
<p style={{ color: "#6b7280" }}>

// ✅ Correct
<p className="text-muted-foreground">
```

---

## Checklist — Adding a New Component

- [ ] Is it used by 2+ pages? → `components/` (or a subdirectory if 2+ related components)
- [ ] Is it used by only 1 page? → co-locate next to the page file
- [ ] Does it need interactivity? → add `"use client"` at the top
- [ ] Does the UI primitive already exist in `@thinkthroo/ui`? → use it, don't rebuild
- [ ] Is it a modal? → use `Dialog` from `@thinkthroo/ui/components/dialog`
- [ ] Is it a table? → use `columns.tsx` + `data-table.tsx` pattern in a subdirectory
- [ ] Named export or default export? → prefer named exports
- [ ] Icons from `lucide-react`?
- [ ] Styling via Tailwind + `cn()`?
- [ ] Design tokens for colors (no hardcoded hex values)?
