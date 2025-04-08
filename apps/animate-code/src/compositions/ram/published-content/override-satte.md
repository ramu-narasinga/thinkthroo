!videoTitle How to Override Your Zustand State

## !!steps

!duration 200

!title 1. Understanding State Merging vs. State Overriding

```ts ! zustand/tests/basic.test.tsx
// Zustand allows you to either 
// merge or completely override the state.
// !callout[/setState/] Merging keeps previous state properties intact, while overriding replaces the entire state with a new object.
const { setState, getState } = create<
  { a: number } | 
  { b: number }>(
  (_set) => ({
    a: 1,
  })
);
```

## !!steps

!duration 210

!title 2. Overriding the State

```ts ! zustand/tests/basic.test.tsx
// Replacing the entire state with a new one
// !callout[/setState/] Passing `true` as the second argument tells Zustand to override the existing state instead of merging it.
setState({ b: 2 }, true); 
// Overrides the state, removing the `a` property.
```

## !!steps

!duration 220

!title 3. Validating the State Replacement

```ts ! zustand/tests/basic.test.tsx
// Validating that the state was replaced entirely
// !callout[/getState/] The state is now { b: 2 }, and the previous `a` value is gone.
expect(getState()).toEqual({ b: 2 });
// Confirms the old state was completely replaced.
```

## !!steps

!duration 230

!title 4. How Zustand Overrides State

```ts ! zustand/tests/basic.test.tsx
// Zustand's internal mechanism for state overriding
// !callout[/replace/] Zustand uses a `replace` flag internally to determine if the state should be overridden.
(replace ?? (typeof nextState !== 'object' || nextState === null))
```

## !!steps

!duration 240

!title 5. When to Override State

```ts ! zustand/tests/basic.test.tsx
// Common scenarios where overriding state is useful
// !callout[/setState/] Use state overriding when you need to reset the state entirely, such as after form submissions or loading new data.
setState({ form: {} }, true); // Reset form state
```