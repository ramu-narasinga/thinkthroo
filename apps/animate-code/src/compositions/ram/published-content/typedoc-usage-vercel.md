!videoTitle How TypeDoc is Used in the @vercel/edge Package

## !!steps
!duration 200

!title 1. What is TypeDoc?

```ts ! typedoc.org
// TypeDoc Overview
// !callout[/TypeDoc/] TypeDoc is a tool that generates HTML documentation or a JSON model from TypeScript comments.
TypeDoc.org
```

## !!steps
!duration 220

!title 2. Configuration of TypeDoc in @vercel/edge

```js ! @vercel/edge/typedoc.json
// Example of a typedoc.json file used in @vercel/edge
{
// !callout[/$schema/] This file configures TypeDoc to generate documentation for the @vercel/edge package.
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src/index.ts"],
  "plugin": [
    "typedoc-plugin-markdown", 
    "typedoc-plugin-mdn-links"
  ],
  "out": "docs",
  "githubPages": false,
  "gitRevision": "main",
  "readme": "none",
  "hideBreadcrumbs": true
}
```

## !!steps
!duration 210

!title 3. Example: ModifiedRequest Interface in @vercel/edge

```ts ! @vercel/edge/middleware-helpers.ts
// Example of how comments in code are 
// converted into documentation by TypeDoc.
// !callout[/ModifiedRequest/] The comments in this interface are converted into a markdown file by TypeDoc.
export interface ModifiedRequest {
 /**
  * If set, overwrites the incoming 
  * headers to the origin request.
  */
 headers?: Headers;
}
```

## !!steps
!duration 200

!title 4. Documentation Generation Command

```json ! package.json
// Command used to generate the documentation
// !callout[/build:docs/] This command runs TypeDoc, formats the output with Prettier, and fixes the generated links.
"build:docs": "typedoc && 
              node scripts/fix-links.js && 
              prettier --write docs/**/*.md docs/*.md"
```