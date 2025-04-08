!videoTitle Custom Equality Function in Zustand

## !!steps

!duration 200

!title 1. Overview of Custom Equality Function in Zustand

```ts ! zustand/tests/basic.test.tsx
// Zustand allows defining custom equality 
// functions to control re-renders
// !callout[/createWithEqualityFn/] `createWithEqualityFn` is used to define a store with a custom equality function.
const useBoundStore = createWithEqualityFn(
  () => ({ value: 'foo' }), 
  Object.is
);
```

## !!steps

!duration 210

!title 2. Writing a Custom Equality Function

```ts ! zustand/tests/basic.test.tsx
// Defining a custom equality function 
// that compares `value` properties
// !callout[/equalityFn/] The equality function compares `value` in two states but is intentionally written to throw an error for non-strings.
const equalityFn = (a: State, b: State) =>
// This will throw an error if `value` is a number.
  a.value.trim() === b.value.trim(); 
```

## !!steps

!duration 220

!title 3. Triggering State Updates with Custom Equality

```ts ! zustand/tests/basic.test.tsx
// Triggering state updates to see 
// how the custom equality function handles the changes
// !callout[/setState/] The state is updated using `setState`, and the custom equality function determines if a re-render is needed.
const { setState } = useBoundStore;

act(() => {
  // This update will throw an error 
  // because `trim()` is not valid for numbers.
  setState({ value: 123 }); 
});
```

## !!steps

!duration 230

!title 4. Error Handling in Custom Equality Function

```ts ! zustand/tests/basic.test.tsx
// Handling errors when the 
// custom equality function fails
// !callout[/findByText/] The custom equality function throws an error, which is caught and displayed by the ErrorBoundary.
await findByText('errored');
// The error caused by the equality 
// function is caught by the ErrorBoundary. 
```

## !!steps

!duration 240

!title 5. Why Use Custom Equality Functions?

```ts ! zustand/tests/basic.test.tsx
// Why custom equality functions are important in Zustand
// !callout[/equalityFn/] Custom equality functions provide fine-grained control over re-renders, improving performance by avoiding unnecessary updates.
const equalityFn = (a: State, b: State) =>
// More efficient comparison can improve app performance.
  a.value === b.value; 
```