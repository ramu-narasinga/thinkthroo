!videoTitle Conditional State Updates with Zustand's setState

## !!steps

!duration 210

!title 1. Introduction to Conditional State Updates

```ts ! zustand/src/vanilla.ts
// Conditional state updates in Zustand
// !callout[/setState/] Zustand allows conditional updates with `setState`, where the second argument can control whether to merge or replace the state.
setState({ b: 2 }, true);
```

## !!steps

!duration 200

!title 2. The Role of the `replace` Flag

```ts ! zustand/src/vanilla.ts
// Example of setState with replace flag
const { setState, getState } = create<{ a: number; b?: number }>(
  (_set) => ({
    a: 1,
  }),
);

// Replace state with a new object
// !callout[/setState/] When the `replace` flag is true, Zustand replaces the entire state with the new state object, instead of merging it.
setState({ b: 2 }, true);
console.log(getState()); // { b: 2 }
```

## !!steps

!duration 220

!title 3. Practical Implications of State Replacement

```ts ! zustand/src/vanilla.ts
// Practical example of replacing state
// !callout[/create/] Replacing state can be useful for resetting forms, clearing data, or loading new datasets without preserving previous state values.
const useStore = create((set) => ({
  a: 1,
  b: 2,
  reset: () => set({ a: 0, b: 0 }, true),
}));

// Before replacement
// { a: 1, b: 2 }
console.log(useStore.getState()); 

// Resetting state
useStore.getState().reset();
// { a: 0, b: 0 }
console.log(useStore.getState()); 
```

## !!steps

!duration 220

!title 4. Code Insight: Zustand's Implementation

```ts ! zustand/src/vanilla.ts
// Insight into Zustand's state replacement implementation
// !callout[/replace/] Zustand uses the `replace` flag to determine if the next state should replace the current state or be merged with it.
(replace ?? (typeof nextState !== 'object' || nextState === null))
```