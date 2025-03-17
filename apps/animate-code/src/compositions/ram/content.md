!videoTitle Understanding warn-once in Refine

## !!steps

!duration 220

!title 1. What is warn-once?

```ts ! warn-once/index.js
// warn-once ensures a warning is logged only once during development
// !callout[/DEV/] Prints a warning exactly once, suitable for deprecation warnings or missing setup messages.
const DEV = process.env.NODE_ENV !== "production";
const warnings = new Set();
function warnOnce(condition, ...rest) {
  if (DEV && condition) {
    const key = rest.join(" ");
    if (warnings.has(key)) return;
    warnings.add(key);
    console.warn(...rest);
  }
}
module.exports = warnOnce;
```

## !!steps

!duration 220

!title 2. Installing warn-once

```sh ! terminal
# Install warn-once via npm
npm install warn-once
```

## !!steps

!duration 220

!title 3. Usage of warn-once

```ts ! warn-once/example.js
const warnOnce = require('warn-once');
// !callout[/warnOnce/] Accepts a condition and a message, ensuring the message logs only once.
warnOnce(true, 'This is a warning message');
```

## !!steps

!duration 220

!title 4. warn-once in Refine source code

```ts ! refine/hooks/breadcrumbs/index.ts
if (action && action !== "list") {
  const key = `actions.${action}`;
  if (typeof i18nProvider !== "undefined" && translate(key) === key) {
    warnOnce(true, `[useBreadcrumb]: Missing translate key for "${action}".`);
  }
}
```

## !!steps

!duration 220

!title 5. Code review of warn-once

```ts ! warn-once/index.js
// !callout[/warnings/] Ensures a message is logged only once.
const warnings = new Set();
function warnOnce(condition, ...rest) {
  if (DEV && condition) {
    const key = rest.join(" ");
    if (!warnings.has(key)) {
      warnings.add(key);
      console.warn(...rest);
    }
  }
}
```

---

title: "Understanding warn-once in Refine"
description: "A deep dive into the warn-once package, its usage in Refine's source code, and how it prevents duplicate warnings."
tags: [warn-once, Refine, JavaScript, open-source, debugging]

