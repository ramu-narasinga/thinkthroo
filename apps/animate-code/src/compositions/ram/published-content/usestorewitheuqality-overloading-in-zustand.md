!videoTitle "Exploring useStoreWithEqualityFn Overloading in Zustand"

## !!steps

!duration 200

!title 1. What is Overloading in useStoreWithEqualityFn?

```ts ! zustand/src/traditional.ts
// !callout[/useStoreWithEqualityFn/] useStoreWithEqualityFn has multiple signatures to handle different scenarios for state subscription and optimization.
export function useStoreWithEqualityFn<
  S extends ReadonlyStoreApi<unknown>
>(
  api: S,
): ExtractState<S>
export function useStoreWithEqualityFn<
  S extends ReadonlyStoreApi<unknown>, U
>(
  api: S,
  selector: (state: ExtractState<S>) => U,
  equalityFn?: (a: U, b: U) => boolean,
): U
export function useStoreWithEqualityFn<TState, StateSlice>(
  api: ReadonlyStoreApi<TState>,
  selector: (state: TState) => StateSlice = identity as any,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean,
) {
  // ...
}
```

## !!steps

!duration 210

!title 2. Handling Different Scenarios with Overloading

```ts ! zustand/src/traditional.ts
// !callout[/useStoreWithEqualityFn/] Allows flexible use of the hook based on the provided arguments, either returning the full state or a specific slice with optimization.
export function useStoreWithEqualityFn<
  S extends ReadonlyStoreApi<unknown>
>(
  api: S,
): ExtractState<S> 
// Handles case where no selector or equality function is provided.

export function useStoreWithEqualityFn<
  S extends ReadonlyStoreApi<unknown>, U
>(
  api: S,
  selector: (state: ExtractState<S>) => U,
  equalityFn?: (a: U, b: U) => boolean,
): U 
// Handles case with selector and optional equality function.
```

## !!steps

!duration 220

!title 3. Using Selector and Equality Function

```ts ! zustand/src/traditional.ts
const slice = useStoreWithEqualityFn(
  api,
  // !callout[/selector/] Applies the selector function to extract a slice of the state.
  selector,
  // !callout[/equalityFn/] Uses the equality function to compare previous and current slices to optimize re-renders.
  equalityFn
)
```

## !!steps

!duration 200

!title 4. Example of Overloading in Action

```ts ! zustand/src/traditional.ts
// Example with selector and equality function
// !callout[/useStoreWithEqualityFn/] Demonstrates how overloading works with a selector function and equality function for fine-grained control over state updates.
const value = useStoreWithEqualityFn(
  api, 
  state => state.value, 
  (a, b) => a === b
)
```

## !!steps

!duration 210

!title 5. Benefits of Overloading in Zustand

```ts ! zustand/src/traditional.ts
// Benefits of overloading
// - Flexibility in state subscription
// - Optimization of re-renders
// - Support for various use cases with different arguments
// !callout[/benefits/] Enhances flexibility and performance by supporting multiple ways to interact with the store state based on different requirements.
```