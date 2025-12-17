# Repositories Structure

> Next.js 15 App Router | ✅ Migrated from React Router

## 📂 Structure

```
repositories/
├── page.tsx                              # /repositories (list view)
│
├── (list)/                               # List-only resources (route group)
│   ├── components/                       # AddReposButton, DataTable, Columns, Header, NoRepoScreen
│   ├── features/                         # RepositoriesListPage
│   └── hooks/                            # useRepositories
│
└── [repository]/                         # /repositories/[repo] (dynamic route)
    ├── page.tsx                         # Redirects to /architecture
    ├── layout.tsx                       # Tabs + header (wraps all child routes)
    │
    ├── architecture/                    # /repositories/[repo]/architecture
    │   ├── page.tsx
    │   ├── components/                  # ArchitectureTab, TipTapEditor, Modals
    │   ├── hooks/
    │   └── utils/extensions/            # TipTap extensions
    │
    ├── reviews/                         # /repositories/[repo]/reviews
    │   ├── page.tsx
    │   ├── components/                  # ReviewsTab
    │   └── hooks/
    │
    └── general/                         # /repositories/[repo]/general
        ├── page.tsx
        ├── components/                  # GeneralTab
        └── hooks/
```

## 🗺️ Routes

| URL | File | Type |
|-----|------|------|
| `/repositories` | `page.tsx` | Server |
| `/repositories/[repo]` | `[repository]/page.tsx` | Server (redirect) |
| `/repositories/[repo]/architecture` | `[repository]/architecture/page.tsx` | Server |
| `/repositories/[repo]/reviews` | `[repository]/reviews/page.tsx` | Server |
| `/repositories/[repo]/general` | `[repository]/general/page.tsx` | Server |

## 🎯 Key Concepts

### File Types
- `page.tsx` = Route (creates URL)
- `layout.tsx` = Wrapper (wraps children, no URL)
- `(folder)` = Route group (organize, no URL)
- `[folder]` = Dynamic route (URL param)

### Colocation Rule
**Keep code close to where it's used**

```
✅ Used in ONE tab → Keep in that tab's folder
✅ Used in MULTIPLE tabs → Move to [repository] level
✅ Used in list AND detail → Move to repositories level
✅ Used app-wide → Move to app/components
```

### Server vs Client
```typescript
// Server (default) - faster, SEO
export default function Page() { }

// Client - interactivity needed
'use client';
export default function Tab() { }
```

## 📊 Import Examples

```typescript
// List page
import RepositoriesListPage from "./(list)/features/RepositoriesListPage";

// Feature component
import DataTable from '../components/DataTable'        // Same route
import { Button } from '@/components/ui/button'        // Shared

// Tab page
import ArchitectureTab from './components/ArchitectureTab'

// Access params
const params = useParams();
const repo = params.repository;  // "vercel-next.js"
```

## 🏗️ Layout Hierarchy

```
app/layout.tsx (root)
  ↓
app/(platform)/layout.tsx (sidebar + breadcrumbs)
  ↓
repositories/page.tsx (list)
  OR
[repository]/layout.tsx (tabs)
  ↓
architecture/page.tsx
```

## ✅ Naming

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | `architecture/page.tsx` |
| Layout | `layout.tsx` | `[repository]/layout.tsx` |
| Component | `PascalCase.tsx` | `DataTable.tsx` |
| Hook | `use[Name].ts` | `useRepositories.ts` |
| Util | `camelCase.ts` | `formatDate.ts` |

## 🚦 Decision Tree

```
Where does this file go?

Used by 1 tab only?
  → architecture/ or reviews/ or general/

Used by multiple tabs?
  → [repository]/ level

Used by list AND detail?
  → repositories/ level

Used everywhere?
  → app/components/
```

## 🔄 Migration from React Router

### Changes Made
- ❌ Removed `react-router-dom` dependency
- ❌ Deleted `routes/` folder → Use `page.tsx`
- ❌ Deleted `_layout/` → Use `layout.tsx`
- ✅ `<Outlet />` → `{children}`
- ✅ `useParams(), useLocation()` → From `next/navigation`
- ✅ `<Link to="">` → `<Link href="">` from `next/link`
- ✅ `useNavigate()` → `useRouter()`
- ✅ Removed `router.config.tsx` → File structure = routes

### Before/After
```typescript
// Before (React Router)
// router.config.tsx
{ path: 'repositories/:repository/architecture', element: <Page /> }

// After (Next.js)
app/(platform)/repositories/[repository]/architecture/page.tsx
```

## 📝 Status

✅ **Completed**
- All routes migrated (`page.tsx` files)
- All layouts migrated (`layout.tsx`)
- All tabs (architecture, reviews, general)
- List view with DataTable, Columns, etc.
- Architecture with TipTapEditor, Modals
- React Router removed

## 🔗 Related
- [Universal Standards](./universal-standards.md)
- [LobeChat Patterns](./lobechat-patterns.md)
