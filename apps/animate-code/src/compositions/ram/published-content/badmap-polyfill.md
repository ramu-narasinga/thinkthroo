!videoTitle Understanding BadMapPolyfill in React Source Code

## !!steps
!duration 200

!title 1. Introduction to BadMapPolyfill

```ts ! react/source-code
// Introduction to BadMapPolyfill
// !callout[/hasBadMapPolyfill/] `BadMapPolyfill` is used in React to detect issues with Map and Set polyfills in development mode (`__DEV__`). It tests if a Map or Set can be created with frozen objects.
export let hasBadMapPolyfill: boolean;
if (__DEV__) {
  hasBadMapPolyfill = false;
  try {
    const frozenObject = Object.freeze({});
    // !callout[/Map/] Attempts to create a Map and Set with a frozen object. If this fails, the system likely has a bad Map or Set polyfill.
    new Map([[frozenObject, null]]);
    new Set([frozenObject]);
  } catch (e) {
    // Sets the flag to true if polyfill is bad.
    hasBadMapPolyfill = true; 
  }
}
```

## !!steps
!duration 220

!title 2. Why the BadMapPolyfill Exists

```ts ! react/source-code
// Purpose of BadMapPolyfill
// !callout[/try/] This check ensures that if there’s a broken polyfill for `Map` or `Set`, React can detect it early and avoid potential bugs.
try {
  new Map([[frozenObject, null]]);
  new Set([frozenObject]);
} catch (e) {
  // Catches the error and flags the polyfill as broken.
  hasBadMapPolyfill = true;
}
```

## !!steps
!duration 230

!title 3. ESLint and the `no-new` Rule

```ts ! react/source-code
// ESLint 'no-new' Rule
// !callout[/Map/] The ESLint `no-new` rule prevents using the `new` keyword without assigning the result to a variable. This is ignored in this case to test if `Map` and `Set` can be created with frozen objects.
new Map([[frozenObject, null]]);
new Set([frozenObject]);
```

## !!steps
!duration 240

!title 4. Map and Set Polyfills in Core-JS

```ts ! react/source-code
// Polyfills in Core-JS
// !callout[/import/] A polyfill is a piece of code that provides modern functionality on older browsers that do not natively support it. React uses `BadMapPolyfill` to detect polyfill issues with `Map` and `Set`.
import 'core-js/features/map';
// Polyfills for older environments. 
import 'core-js/features/set';
```

## !!steps
!duration 220

!title 5. Where is BadMapPolyfill Used in React?

```ts ! react/source-code
// Where BadMapPolyfill is Used in React
// !callout[/hasBadMapPolyfill/] The `hasBadMapPolyfill` check is also found in `ReactFiber.js`, where it is re-implemented to ensure consistency across React’s internal logic.
import { hasBadMapPolyfill } from 'react-reconciler/src/ReactFiber';

if (hasBadMapPolyfill) {
  // Handle issues with Map/Set polyfills
}
```