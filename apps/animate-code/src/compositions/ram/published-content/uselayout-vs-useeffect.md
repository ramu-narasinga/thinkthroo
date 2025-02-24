!videoTitle useLayoutEffect vs useEffect in React

## !!steps

!duration 200

!title 1. Introduction to useLayoutEffect and useEffect

```ts ! react/src/hooks/useLayoutEffect.ts
// Introduction to useLayoutEffect and useEffect
// !callout[/useLayoutEffect/] `useLayoutEffect` and `useEffect` are both hooks in React for handling side effects, but they have different timing and use cases.
import { useLayoutEffect, useEffect } from 'react';
```

## !!steps

!duration 210

!title 2. How useEffect Works

```ts ! react/src/hooks/useEffect.ts
// Overview of useEffect
// !callout[/useEffect/] `useEffect` runs asynchronously after the browser has painted the UI. It's ideal for side effects that don’t need to block the visual update.
import { useEffect } from 'react';

useEffect(() => {
  // Side effect logic here
  console.log('useEffect: This runs after the paint.');
}, []);
```

## !!steps

!duration 210

!title 3. How useLayoutEffect Works

```ts ! react/src/hooks/useLayoutEffect.ts
// Overview of useLayoutEffect
// !callout[/useLayoutEffect/] `useLayoutEffect` runs synchronously after DOM mutations but before the browser paints. This ensures updates are reflected immediately.
import { useLayoutEffect } from 'react';

useLayoutEffect(() => {
  // Side effect logic here
  console.log('useLayoutEffect: This runs before the paint.');
}, []);
```

## !!steps

!duration 220

!title 4. Key Differences Between useEffect and useLayoutEffect

```ts ! react/src/hooks/comparison.ts
// Comparing useEffect and useLayoutEffect
// !callout[/useEffect/] `useEffect` does not block the paint and runs after it
useEffect(() => {...}

// !callout[/useLayoutEffect/] `useLayoutEffect` runs before the paint, blocking it if necessary.
useLayoutEffect(() => {...}
```

## !!steps

!duration 230

!title 5. When to Use useEffect

```ts ! react/src/hooks/useEffect.ts
// Use cases for useEffect
// !callout[/useEffect/] Use `useEffect` for non-critical side effects like data fetching, subscriptions, or timers where blocking the paint is not necessary.
import { useEffect } from 'react';

useEffect(() => {
  fetchData(); // Example of data fetching
}, []);
```

## !!steps

!duration 230

!title 6. When to Use useLayoutEffect

```ts ! react/src/hooks/useLayoutEffect.ts
// Use cases for useLayoutEffect
// !callout[/useLayoutEffect/] Use `useLayoutEffect` when you need to make sure DOM updates are completed before the browser paints, such as for layout measurements or animations.
import { useLayoutEffect } from 'react';

useLayoutEffect(() => {
  measureLayout(); // Example of measuring layout
}, []);
```