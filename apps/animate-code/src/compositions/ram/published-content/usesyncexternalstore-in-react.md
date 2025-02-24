!videoTitle useSyncExternalStore in React Explained

## !!steps

!duration 180

!title 1. What is useSyncExternalStore?

```ts ! react
// !callout[/useSyncExternalStore/] A React Hook that allows you to subscribe to an external store and retrieve its value.
const snapshot = useSyncExternalStore(
                  subscribe, 
                  getSnapshot, 
                  getServerSnapshot?
                )
```

## !!steps

!duration 200

!title 2. Key Parameters of useSyncExternalStore

```ts ! react
// !callout[/subscribe/] Function that subscribes to the store for updates.
const subscribe = () => { /* subscribe to the store */ }
// !callout[/getSnapshot/] Function that retrieves the current store state.
const getSnapshot = () => { /* return current store value */ }
// !callout[/getServerSnapshot/] Optional function to get the snapshot for server-side rendering.
const getServerSnapshot = () => { 
  /* optional: return snapshot for server rendering */ 
}
const snapshot = useSyncExternalStore(
                  subscribe, 
                  getSnapshot, 
                  getServerSnapshot
                )
```

## !!steps

!duration 210

!title 3. How useSyncExternalStore Integrates with External Stores

```ts ! react
import { useSyncExternalStore } from 'react';
import { todosStore } from './todoStore.js';

function TodosApp() {
  const todos = useSyncExternalStore(
    // !callout[/todosStore.subscribe/] Subscribes to the changes in the todosStore.
    todosStore.subscribe, 
    // !callout[/todosStore.getSnapshot/] Retrieves the current state of todosStore when rendered.
    todosStore.getSnapshot
  );
  // ...
}
```

## !!steps

!duration 230

!title 4. The Benefit of useSyncExternalStore

```ts ! react
// !callout[/todos/] Ensures React consistently updates its UI by subscribing to external stores, improving synchronization and avoiding stale state issues.
const todos = useSyncExternalStore(todosStore.subscribe, todosStore.getSnapshot);
```

!duration 200

!title 5. Server-side Rendering with useSyncExternalStore

```ts ! react
const snapshot = useSyncExternalStore(
  todosStore.subscribe,
  todosStore.getSnapshot,
  // !callout[/getServerSnapshot/] Provides support for server-side rendering by delivering the appropriate snapshot during server render.
  todosStore.getServerSnapshot
);
```