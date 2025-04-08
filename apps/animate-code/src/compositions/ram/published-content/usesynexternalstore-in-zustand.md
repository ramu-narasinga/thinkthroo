!videoTitle useSyncExternalStoreExports in Zustand Source Code Explained

## !!steps

!duration 200

!title 1. Importing useSyncExternalStoreExports

```ts ! zustand/src/traditional.ts
// eslint-disable-next-line import/extensions
import 
  // !callout[/useSyncExternalStoreExports/] Zustand imports useSyncExternalStoreExports to utilize React's external store subscription functionality with a selector.
  useSyncExternalStoreExports 
  from 'use-sync-external-store/shim/with-selector'
```

## !!steps

!duration 180

!title 2. De-structuring useSyncExternalStoreWithSelector

```ts ! zustand/src/traditional.ts
const { 
  // !callout[/useSyncExternalStoreWithSelector/] This line de-structures useSyncExternalStoreWithSelector from useSyncExternalStoreExports to enable selector-based subscriptions.
  useSyncExternalStoreWithSelector 
} = useSyncExternalStoreExports
```

## !!steps

!duration 200

!title 3. Using useSyncExternalStoreWithSelector in useStoreWithEqualityFn

```ts ! zustand/src/traditional.ts
export function useStoreWithEqualityFn<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean,
) {
  // !callout[/useSyncExternalStoreWithSelector/] This function subscribes to the store and uses the selector and equality function to return the appropriate state slice.
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

!duration 220

!title 4. Subscribing to Zustand's store

```ts ! zustand/src/traditional.ts
const slice = useSyncExternalStoreWithSelector(
  // !callout[/api.subscribe/] Subscribes to the Zustand store's state changes.
  api.subscribe,
  api.getState,
  api.getInitialState,
  // !callout[/selector/] The selector function is applied to choose the specific part of the state.
  selector,
  // !callout[/equalityFn/] The equality function compares previous and next state slices for optimization.
  equalityFn,
)
```