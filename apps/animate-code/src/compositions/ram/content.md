!videoTitle State Management in React-Scan

## !!steps

!duration 220

!title 1. Overview of State Management in React-Scan

```ts ! scan/core/src/index.ts
// Store definition in React-Scan
// !callout[/Store/] The central state management object in React-Scan.
export const Store: StoreType = {
  wasDetailsOpen: signal(true),
  isInIframe: signal(
    typeof window !== 'undefined' && window.self !== window.top,
  ),
  inspectState: signal<States>({ kind: 'uninitialized' }),
  monitor: signal<Monitor | null>(null),
};
```

## !!steps

!duration 220

!title 2. Understanding signal in React-Scan

```ts ! preact/signals.ts
// Importing signal from Preact
// !callout[/signal/] A reactive primitive from Preact used for automatic state updates.
import { type Signal, signal } from '@preact/signals';
```

## !!steps

!duration 220

!title 3. Using signal for State Management

```ts ! scan/core/monitor/performance.ts
// Example usage of signal-based state
// !callout[/monitor.value/] Retrieves the current monitoring state.
const monitor = Store.monitor.value;
if (!monitor) return;
```

## !!steps

!duration 220

!title 4. Signals in Component State

```ts ! scan/web/views/index.tsx
// Usage of signal inside a React component
// !callout[/useComputed/] Derives state reactively using signals.
const isInspecting = useComputed(
  () => Store.inspectState.value.kind === 'inspecting',
);
```

## !!steps

!duration 220

!title 5. Signals in UI Logic

```ts ! scan/src/web/widget/resize-handle.tsx
// Managing UI visibility using signals
// !callout[/updateVisibility/] Tracks component focus state.
const updateVisibility = () => {
  const isFocused = Store.inspectState.value.kind === 'focused';
  return isFocused;
};
```

## Title: Understanding State Management in React-Scan

## Description:
In this video, we explore how state is managed in the React-Scan codebase. We break down the `Store` object, analyze the role of `signal` from Preact, and examine how it simplifies state management across components. Learn how React-Scan efficiently tracks state changes and updates UI reactively using signals.

## Tags:
#React #StateManagement #OpenSource #Preact #Signals #WebDevelopment

