!videoTitle "useDebugValue Usage in Zustand Source Code Explained"

## !!steps

!duration 200

!title 1. What is useDebugValue?

```ts ! react
// !callout[/useDebugValue/] A React Hook that adds a label to custom Hooks in React DevTools for better debugging.
import { useDebugValue } from 'react';

function useOnlineStatus() {
  useDebugValue(
    isOnline ? 
    'Online' : 
    'Offline'
  );
}
```

## !!steps

!duration 210

!title 2. Using useDebugValue in useStoreWithEqualityFn

```ts ! zustand/src/traditional.ts
export function useStoreWithEqualityFn<TState, StateSlice>(
  // ...params
) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getInitialState,
    selector,
    equalityFn,
  )
  // !callout[/useDebugValue/] Used to label the slice value in React DevTools, aiding in debugging and providing visibility into the current state slice.
  useDebugValue(slice)
  return slice
}
```

## !!steps

!duration 200

!title 3. How useDebugValue Enhances Debugging

```ts ! zustand/src/traditional.ts
// !callout[/slice/] By displaying a readable label for the slice in React DevTools, useDebugValue helps developers understand and debug the state slice being used.
useDebugValue(slice)
```

## !!steps

!duration 220

!title 4. Example of useDebugValue in Zustand's Source Code

```ts ! zustand/src/react.ts
// Example usage of useDebugValue in Zustand's source code
import { useDebugValue } from 'react';

// ...
// !callout[/someDebugValue/] Similar to useStoreWithEqualityFn, useDebugValue is utilized in other parts of Zustand for enhanced debugging in React DevTools.
useDebugValue(someDebugValue)

```