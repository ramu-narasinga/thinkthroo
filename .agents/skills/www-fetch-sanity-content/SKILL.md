# www — Fetching Content from Sanity

Skill for the `apps/www` workspace. Use when creating pages that display content managed in Sanity CMS (blog posts, legal pages, policy documents, or any single/collection document type).

---

## Stack

| Concern | Tool |
|---------|------|
| Sanity client | `apps/www/sanity/client.ts` |
| GROQ queries | `apps/www/sanity/lib/queries.ts` |
| Fetch functions | `apps/www/lib/articles.ts` |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| PortableText rendering | `apps/www/app/(modules)/blog/[slug]/renderer.tsx` |

---

## Sanity Client

```ts
// apps/www/sanity/client.ts
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "13jolr5q",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});
```

Always import from `@/sanity/client`. Never instantiate a new client directly in pages or components.

---

## GROQ Query Patterns

### Single document (one per type — e.g. legal pages)
```ts
`*[_type == "privacy"][0]{ _id, title, body, publishedAt }`
```

### Single document by slug
```ts
`*[_type == "post" && slug.current == $slug][0]{ _id, title, body }`
```
Pass params as the second argument to `client.fetch()`:
```ts
client.fetch(QUERY, { slug })
```

### Collection (all documents of a type)
```ts
`*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[]{
  "slug": slug.current,
  title,
  publishedAt
}`
```

---

## Adding Queries

Add GROQ queries as named exports in `apps/www/sanity/lib/queries.ts`:

```ts
export const PRIVACY_QUERY = `*[_type == "privacy"][0]{ _id, title, body, publishedAt }`
export const TERMS_QUERY   = `*[_type == "terms"][0]{ _id, title, body, publishedAt }`
export const REFUND_QUERY  = `*[_type == "refund"][0]{ _id, title, body, publishedAt }`
```

---

## Adding Fetch Functions

Add typed fetch functions in `apps/www/lib/articles.ts`:

```ts
import { client } from "@/sanity/client";
import { type SanityDocument } from "next-sanity";

export async function fetchPrivacyPolicy() {
  return client.fetch<SanityDocument>(
    `*[_type == "privacy"][0]{ _id, title, body, publishedAt }`
  );
}
```

- Use `client.fetch<SanityDocument>()` for typed results.
- No revalidation is needed — content is static. Rebuild or use on-demand revalidation via Sanity webhook for updates.

---

## Body Field Types

Sanity documents in this project use **two** body field formats depending on schema:

| Format | Type | How to render |
|--------|------|---------------|
| Markdown string | `string` | `ReactMarkdown` + `remark-gfm` |
| Portable Text (block array) | `PortableTextBlock[]` | `<Renderer body={...} />` from `@/app/(modules)/blog/[slug]/renderer.tsx` |

**Legal pages** (`privacy`, `terms`, `refund`) use the `markdown` field type → render with `ReactMarkdown`.

**Blog posts** may use either (check `typeof body === 'string'`) → the `Renderer` component handles both.

---

## Page Pattern — Single Sanity Document (Markdown body)

```tsx
// apps/www/app/(marketing)/privacy/page.tsx
import { notFound } from "next/navigation";
import { fetchPrivacyPolicy } from "@/lib/articles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function PrivacyPolicyPage() {
  const doc = await fetchPrivacyPolicy();

  if (!doc) notFound();

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{doc.title}</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.body}</ReactMarkdown>
      </div>
    </div>
  );
}
```

---

## Page Placement

- **Marketing pages** (legal, pricing, landing) → `apps/www/app/(marketing)/`
  - Wrapped in `SiteHeader` + `Footer` via `(marketing)/layout.tsx`
- **Content pages** (blog, docs) → `apps/www/app/(modules)/`
  - Blog detail pages use `fumadocs-ui` `DocsPage` layout

---

## Existing Document Types in Sanity

| Type name | Title | Body format | Used in |
|-----------|-------|-------------|---------|
| `post` | Blog post | markdown or PortableText | `(modules)/blog/` |
| `privacy` | Privacy Policy | markdown | `(marketing)/privacy/` |
| `terms` | Terms of Service | markdown | `(marketing)/terms/` |
| `refund` | Refund Policy | markdown | `(marketing)/refund/` |
| `codebaseArchitecture` | Codebase Architecture | — | — |
| `module` / `chapter` | Course content | — | — |

---

## Checklist

When adding a new Sanity-backed page:

1. Identify the `_type` name in `apps/sanity-studio/schemaTypes/`
2. Add a GROQ query to `apps/www/sanity/lib/queries.ts`
3. Add a fetch function to `apps/www/lib/articles.ts`
4. Create the page file in the appropriate route group
5. Handle `!doc` with `notFound()`
6. Render markdown body with `ReactMarkdown` + `remark-gfm`, or PortableText with `<Renderer />`
