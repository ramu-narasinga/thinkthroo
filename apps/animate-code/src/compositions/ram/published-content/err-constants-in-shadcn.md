!videoTitle How Shadcn CLI Uses Error Constants to Improve Code Readability

## !!steps
!duration 200

!title 1. Introduction to Error Constants in Shadcn CLI

```ts ! shadcn/utils/errors.ts
// Error constants in Shadcn CLI
// !callout[/MISSING_DIR_OR_EMPTY_PROJECT/] Describes a missing directory or empty project scenario.
export const MISSING_DIR_OR_EMPTY_PROJECT = "1"
export const EXISTING_CONFIG = "2"
export const MISSING_CONFIG = "3"
export const FAILED_CONFIG_READ = "4"
// Additional constants
export const TAILWIND_NOT_CONFIGURED = "5"
export const IMPORT_ALIAS_MISSING = "6"
```

## !!steps
!duration 210

!title 2. Example Usage in Preflight-Init

```ts ! shadcn/src/preflight-init.ts
// Usage of error constants in preflight-init.ts
// !callout[/fs.existsSync/] Handles the case where a directory is missing or the project is empty.
if (
   !fs.existsSync(options.cwd) ||
   !fs.existsSync(path.resolve(options.cwd, "package.json"))
 ) {
   errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
   return {
     errors,
     projectInfo: null,
   }
 }
```

## !!steps
!duration 220

!title 3. How Errors Object is Used in Init.ts

```ts ! shadcn/src/init.ts
// Checking errors in init.ts
// !callout[/ERRORS.MISSING_DIR_OR_EMPTY_PROJECT/] The error constant improves readability and avoids using "magic values".
if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
  const { projectPath } = await createProject(options)
  if (!projectPath) {
    process.exit(1)
  }
  options.cwd = projectPath
  options.isNewProject = true
}
```

## !!steps
!duration 200

!title 4. Importance of Using Constants for Readability

```ts ! shadcn/utils/errors.ts
// Benefit of using constants instead of hardcoded values
// !callout[/MISSING_DIR_OR_EMPTY_PROJECT/] Using hardcoded error codes would reduce code readability and maintainability.
export const MISSING_DIR_OR_EMPTY_PROJECT = "1"
// Descriptive constants help developers immediately 
// understand what each error means without having to 
// look up "1", "2", or "3" elsewhere in the codebase.
```