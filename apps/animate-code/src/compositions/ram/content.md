!videoTitle How Nue.js Adds Console Colors Without External Libraries

## !!steps

!duration 220

!title 1. Custom log Function in Nue.js CLI

```ts ! packages/nuekit/src/util.js
// log function used in Nue CLI
// !callout[/log/] Logs output with a green checkmark symbol followed by the main message and optional extra text.
export function log(msg, extra = '') {
  console.log(colors.green('✓'), msg, extra)
}
```

## !!steps

!duration 220

!title 2. The printVersion Function

```ts ! packages/nuekit/src/cli.js
// Usage of log in printVersion
// !callout[/printVersion/] Calls `log` with version details and a green bullet using `colors.green`.
async function printVersion() {
  log(`Nue ${version} ${colors.green('•')} ${getEngine()}`)
}
```

## !!steps

!duration 220

!title 3. The Custom colors Utility

```ts ! packages/nuekit/src/util.js
// console colors object
// !callout[/colors/] Dynamically creates color formatting functions using ANSI codes. Disables colors when NO_COLOR is set or when unsupported.
export const colors = function () {
  const codes = { green: 32 }
  const fns = {}
  const noColor = process.env.NO_COLOR || 
  !(process.env.TERM || process.platform == 'win32')
  fns.green = msg => noColor ? msg 
  : `\u001b[${codes.green}m${msg}\u001b[39m`
  return fns
}()
```

## !!steps

!duration 220

!title 4. ANSI Escape Code Formatting

```ts ! packages/nuekit/src/util.js
// How color is applied
// !callout[/green/] Wraps message with `\u001b[32m` and `\u001b[39m` for green. These are ANSI escape codes for terminal formatting.
fns.green = msg => noColor
  ? msg
  : `\u001b[32m${msg}\u001b[39m`
```

## !!steps

!duration 220

!title 5. Comparison with chalk or picocolors

```ts ! no/path
// Compared to chalk or picocolors
// !callout[/chalk/] Unlike libraries like `chalk` or `picocolors`, Nue.js implements coloring manually using raw ANSI codes, reducing dependency overhead.
chalk.green('✓') // using chalk
picocolors.green('✓') // using picocolors
colors.green('✓') // custom method in Nue.js
```

---

title: How Nue.js Adds Console Colors Without External Libraries  
description: Nue.js applies CLI colors without using libraries like Chalk or Picocolors. Instead, it builds a custom utility using ANSI escape codes, as seen in the `colors` object in `util.js`. In this video, we break down how it works and how it's used in the CLI log output.  
tags: [nuejs, console, colors, chalk, picocolors, ansi, cli, open-source, codebase-architecture]
```