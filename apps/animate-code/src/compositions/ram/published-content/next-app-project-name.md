!videoTitle How Create-Next-App Validates Your Project Name

## !!steps
!duration 200

!title 1. Overview of Create-Next-App Name Validation

```ts ! create-next-app/src/index.ts
// Name validation in create-next-app
validate: (name) => {
 // !callout[/validateNpmName/] This function validates your project name based on npm naming conventions.
 const validation = validateNpmName(basename(resolve(name)))
 if (validation.valid) {
   return true
 }
 return 'Invalid project name: ' + validation.problems[0]
}
```

## !!steps
!duration 220

!title 2. Naming Conventions for Valid Project Names

```ts ! validate-npm-package-name
// Naming rules for project names
// !callout[/validForNewPackages/] The name must meet specific criteria, such as no spaces and only lowercase characters.
{
 validForNewPackages: true,
 validForOldPackages: true
}
// These are the rules:
// 1. No spaces or uppercase characters
// 2. Only URL-safe characters
// 3. No blacklisted names (e.g., 'http', 'node_modules')
```

## !!steps
!duration 210

!title 3. validateNpmName in Action

```ts ! helpers/validate-pkg.ts
// Usage of validateNpmName
// eslint-disable-next-line import/no-extraneous-dependencies
import validateProjectName from 'validate-npm-package-name'

// !callout[/validateNpmName/] This function ensures that your project name conforms to npm package naming conventions.
validateNpmName(basename(resolve(name)))
```