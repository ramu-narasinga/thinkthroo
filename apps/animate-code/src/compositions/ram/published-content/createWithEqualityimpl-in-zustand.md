!videoTitle createWithEqualityFnImpl in Zustand's Source Code Explained

## !!steps

!duration 200

!title 1. Overview of createWithEqualityFnImpl

```ts ! zustand/src/traditional.ts
// !callout[/createWithEqualityFnImpl/] This function creates a store with custom equality function support, giving you control over component re-renders.
const createWithEqualityFnImpl = <T>(
  createState: StateCreator<T, [], []>,
  defaultEqualityFn?: <U>(a: U, b: U) => boolean,
) => {
  const api = createStore(createState)

  const useBoundStoreWithEqualityFn: any = (
    selector?: any,
    equalityFn = defaultEqualityFn,
  ) => useStoreWithEqualityFn(api, selector, equalityFn)

  Object.assign(useBoundStoreWithEqualityFn, api)

  return useBoundStoreWithEqualityFn
}
```

## !!steps

!duration 210

!title 2. How createWithEqualityFnImpl Uses createStore

```ts ! zustand/src/traditional.ts
// !callout[/createStore/] createStore is called to initialize the Zustand store with the given state creator function.
const api = createStore(createState)
```

## !!steps

!duration 220

!title 3. The Role of useStoreWithEqualityFn

```ts ! zustand/src/traditional.ts
const useBoundStoreWithEqualityFn: any = (
  selector?: any,
  equalityFn = defaultEqualityFn,
  // !callout[/useStoreWithEqualityFn/] This function uses the store API to subscribe to state changes with an optional selector and equality function for optimized re-rendering.
) => useStoreWithEqualityFn(api, selector, equalityFn)
```

## !!steps

!duration 230

!title 4. Understanding Overloaded useStoreWithEqualityFn

```ts ! zustand/src/traditional.ts
// !callout[/useStoreWithEqualityFn/] An overloaded function that supports various usage scenarios for state subscription and re-render optimization.
export function useStoreWithEqualityFn<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean,
) {
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

!duration 200

!title 5. Example: Slice Value and Avoiding Re-renders

```ts ! zustand/src/traditional.ts
// Example showing how re-renders are optimized
// !callout[/equalityFn/] Custom equality functions are used to skip re-renders when the state value has not changed.
const slice = useStoreWithEqualityFn(api, selector, equalityFn)
// value: 1 is skipped if equalityFn detects no change
```