!videoTitle useBoundStoreWithEqualityFn in Zustand Source Code Explained

## !!steps

!duration 200

!title 1. What is useBoundStoreWithEqualityFn?

```ts ! zustand/src/traditional.ts
// !callout[/useBoundStoreWithEqualityFn/] This function calls useStoreWithEqualityFn and binds the returned slice to the api.
const useBoundStoreWithEqualityFn: any = (
  selector?: any,
  equalityFn = defaultEqualityFn,
) => useStoreWithEqualityFn(api, selector, equalityFn)
Object.assign(useBoundStoreWithEqualityFn, api)
return useBoundStoreWithEqualityFn
```

## !!steps

!duration 180

!title 2. useStoreWithEqualityFn Usage in Zustand

```ts ! zustand/src/traditional.ts
export function useStoreWithEqualityFn<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean,
) {
  // !callout[/useSyncExternalStoreWithSelector/] Subscribes to the store and applies the selector and equality function for optimized state selection.
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getInitialState,
    selector,
    equalityFn,
  )
  useDebugValue(slice)
  return slice
}
```

## !!steps

!duration 210

!title 3. Understanding useSyncExternalStoreWithSelector

```ts ! zustand/src/traditional.ts
import 
  useSyncExternalStoreExports from 
  'use-sync-external-store/shim/with-selector'

const {
  // !callout[/useSyncExternalStoreWithSelector/] Zustand uses this to subscribe to external store changes and apply a selector function to the store state. 
  useSyncExternalStoreWithSelector 
} = useSyncExternalStoreExports
```

## !!steps

!duration 230

!title 4. How Object.assign Updates the Store Slice

```ts ! zustand/src/traditional.ts
// !callout[/Object.assign/] This line updates the function returned by useBoundStoreWithEqualityFn with the Zustand store API, allowing access to the store's methods.
Object.assign(useBoundStoreWithEqualityFn, api)
```

## !!steps

!duration 220

!title 5. Returning useBoundStoreWithEqualityFn

```ts ! zustand/src/traditional.ts
// !callout[/return/] The final function returned is useBoundStoreWithEqualityFn, which includes the Zustand store API and the selected slice of state.
return useBoundStoreWithEqualityFn
```