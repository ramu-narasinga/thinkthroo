!videoTitle Understanding StoreApi in Zustand

## !!steps

!duration 200

!title 1. Overview of StoreApi in Zustand

```ts ! zustand/src/vanilla.ts
// StoreApi definition in Zustand
// !callout[/StoreApi/] Defines the API for interacting with Zustand stores, providing methods for state access, updates, and subscription.
export interface StoreApi<T> {
  getState: () => T;
  setState: (
    partial: Partial<T> | 
    (
      (state: T) => Partial<T>
    ), replace?: boolean) => void;
  getInitialState: () => T;
  subscribe: (listener: 
    (state: T) => void) => () => void;
}
```

## !!steps

!duration 210

!title 2. Methods of StoreApi: getState and setState

```ts ! zustand/src/vanilla.ts
// Example usage of getState and setState
const api = createStore(createState);

// !callout[/setState/] `setState` updates the state, allowing both direct and functional updates.
api.setState({ count: 1 });
// !callout[/getState/] `getState` retrieves the current store state
const state = api.getState();
```

## !!steps

!duration 220

!title 3. getInitialState and subscribe

```ts ! zustand/src/vanilla.ts
// Example usage of getInitialState and subscribe
// !callout[/getInitialState/] `getInitialState` provides the initial state
const initialState = api.getInitialState();
// !callout[/subscribe/] `subscribe` allows listening to state changes, with a function to unsubscribe.
const unsubscribe = api.subscribe((newState) => {
  console.log('State changed:', newState);
});
```

## !!steps

!duration 200

!title 4. Practical Example of StoreApi Usage

```ts ! zustand/src/vanilla.ts
// Practical example
// !callout[/createStore/] Demonstrates creating a store, interacting with its API methods to update and access the state, showcasing practical usage.
const useStore = createStore((set) => ({
  count: 0,
  increment: () => set(
    (state) => ({ count: state.count + 1 })
  ),
}));

const { increment, getState } = useStore();
console.log('Current state:', getState());
increment();
console.log('Updated state:', getState());
```