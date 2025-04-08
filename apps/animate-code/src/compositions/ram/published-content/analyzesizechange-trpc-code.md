!videoTitle Understanding analyzeSizeChange Script in tRPC Source Code

## !!steps
!duration 200

!title 1. Overview of analyzeSizeChange Function

```ts ! trpc/scripts/analyzeSizeChange.ts
// !callout[/analyzeSizeChange/] The `analyzeSizeChange` function analyzes module size changes during builds.
export default function analyzeSizeChange(packageDir: string) {
  let analyzePluginIterations = 0;
  return analyze({
    summaryOnly: process.env.CI ? undefined : true,
    skipFormatted: process.env.CI ? true : undefined,
    onAnalysis: (analysis) => {
      if (prevModule) {
        logDifference(
          `Module '${module.id}'`,
          prevModule.size,
          module.size,
        );
      } else {
        logNewModule(module.id, module.size);
      }
    }
  });
}
```

## !!steps
!duration 210

!title 2. logNewModule Function Explained

```ts ! trpc/scripts/analyzeSizeChange.ts
// !callout[/logNewModule/] Logs a new module’s size if it exceeds a certain byte threshold.
function logNewModule(name: string, size: number) {
  if (size < ABSOLUTE_BYTE_CHANGE_THRESHOLD) return;
  
  const options = {
    title: `New Module (${size} bytes in ${name})`,
  };
  const message = `${name} size: ${size} bytes`;
  
  logGithubMessage('notice', message, options);
}
```

## !!steps
!duration 220

!title 3. logDifference Function Explained

```ts ! trpc/scripts/analyzeSizeChange.ts
// !callout[/logDifference/] Logs size differences between current and previous module versions if the change is significant.
function logDifference(
  name: string, 
  before: number, 
  after: number
) {
  const change = difference(before, after);
  if (change.absolute < ABSOLUTE_BYTE_CHANGE_THRESHOLD &&
      change.percent < PERCENT_CHANGE_THRESHOLD) return;
  const options = {
    title: `Important Size Change 
              (${change.absolute} bytes in ${name})`,
  };
  const message = `${name} 
      size change: ${change.absolute} 
      bytes (${change.percent.toFixed(2)}%)`;
  logGithubMessage('error', message, options);
}
```

## !!steps
!duration 200

!title 4. logGithubMessage and Helper Functions

```ts ! trpc/scripts/analyzeSizeChange.ts
// !callout[/logGithubMessage/] Sends formatted log messages to GitHub.
function logGithubMessage(
  type: GitHubLogType,
  message: string,
  options: GitHubLogOptions = {},
) {
  console.log(
    stripAnsiEscapes(
      `::${type} 
        ${formatGithubOptions(options)}
        ::${formatGithubMessage(message)}`,
    ),
  );
}
```