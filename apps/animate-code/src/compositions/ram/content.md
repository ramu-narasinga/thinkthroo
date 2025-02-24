!videoTitle Checking Node.js Version Programmatically

## !!steps

!duration 220

!title 1. Overview of checkNodeVersion

```ts ! father/src/cli/cli.ts
// Function call inside CLI run method
// !callout[/async function/] Ensures the Node.js version meets the required criteria before proceeding with CLI execution.
export async function run(_opts?: IOpts) {
  checkNodeVersion();
}
```

## !!steps

!duration 220

!title 2. Definition of checkVersion

```ts ! father/src/cli/node.ts
// checkVersion implementation
// !callout[/function/] Retrieves the Node.js version as a string, removing the 'v' prefix.
export function checkVersion() {
  const v = parseInt(process.version.slice(1));
}
```

## !!steps

!duration 220

!title 3. Node Version Validation Logic

```ts ! father/src/cli/node.ts
// Version check logic
// !callout[/MIN_NODE_VERSION/] Defines the minimum required Node.js version.
if (v < MIN_NODE_VERSION || v === 15 || v === 17) {
  logger.error(`Your node version ${v} is not supported.`);
}
```

## !!steps

!duration 220

!title 4. Handling Unsupported Versions

```ts ! father/src/cli/node.ts
// Error logging and process exit
// !callout[/logger.error/] Logs an error if the version is not supported.
// !callout[/process.exit/] Exits the process if the version does not meet requirements.
logger.error(`Please upgrade to ${MIN_NODE_VERSION} or above.`);
process.exit(1);
```

## !!steps

!duration 220

!title 5. Summary of checkNodeVersion

```ts ! father/src/cli/node.ts
// Summary of version validation
// !callout[/checkVersion/] Ensures the CLI runs only on supported Node.js versions.
export function checkVersion() {
  const v = parseInt(process.version.slice(1));
  if (v < MIN_NODE_VERSION || v === 15 || v === 17) {
    logger.error(`Your node version ${v} is not supported.`);
    process.exit(1);
  }
}
```

!title Checking Node.js Version Programmatically  
!description The `checkNodeVersion` function ensures that the CLI runs only on supported Node.js versions. It retrieves the version using `process.version.slice(1)`, validates it against a minimum requirement, and exits the process if unsupported. This prevents issues due to deprecated or unstable Node.js versions.  
!tags Node.js, CLI, Version Check, process.version, Open Source
```