!videoTitle createWithEqualityFn test case in Zustand"

## !!steps

!duration 200

!title 1. Setting Up createWithEqualityFn for Testing

```ts ! zustand/src/basic.test.ts
// !callout[/createWithEqualityFn/] Initializes the store with an initial state and an equality function (`Object.is`) to control re-rendering behavior.
const useBoundStore = createWithEqualityFn(
  () => ({ item: { value: 0 } }),
  Object.is,
);
```

## !!steps

!duration 210

!title 2. Component Setup for Testing

```ts ! zustand/src/basic.test.ts
function Component() {
  // Prevent re-render if new value === 1.
  // !callout[/useBoundStore/] Uses `useBoundStore` with a selector and an equality function to prevent re-rendering when the value is 1.
  const item = useBoundStore(
    (s) => s.item,
    (_, newItem) => newItem.value === 1,
  );
  return (
    <div>
      renderCount: {++renderCount}, value: {item.value}
    </div>
  );
```

## !!steps

!duration 220

!title 3. Testing Re-render Prevention

```ts ! zustand/src/basic.test.ts
await findByText('renderCount: 1, value: 0');

// This will not cause a re-render.
act(() => setState({ item: { value: 1 } }));
// !callout[/findByText/] Verifies that updates to the state with value `1` do not trigger a re-render, while other updates do.
await findByText('renderCount: 1, value: 0');

// This will cause a re-render.
act(() => setState({ item: { value: 2 } }));
await findByText('renderCount: 2, value: 2');

```

## !!steps

!duration 200

!title 4. How createWithEqualityFn and Equality Functions Work

```ts ! zustand/src/basic.test.ts
// !callout[/createWithEqualityFn/] `createWithEqualityFn` allows customizing re-render behavior using an equality function, which is tested in the assertions.
// createWithEqualityFn accepts
// - createState: Function to initialize state
// - defaultEqualityFn: Function to compare previous and new state

```