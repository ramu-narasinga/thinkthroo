!videoTitle ReactDOM.unstable_batchedUpdates in Zustand's Test Case

## !!steps

!duration 200

!title 1. Overview of ReactDOM.unstable_batchedUpdates in Zustand

```ts ! zustand/tests/basic.test.tsx
// Example test case from Zustand 
// using ReactDOM.unstable_batchedUpdates
useEffect(() => {   
  // !callout[/unstable_batchedUpdates/] ReactDOM.unstable_batchedUpdates batches multiple state updates into a single render cycle, enhancing performance by reducing unnecessary re-renders.
  ReactDOM.unstable_batchedUpdates(() => {     
    inc();     
    inc();   
  }); 
}, [inc]);
```

## !!steps

!duration 210

!title 2. Zustand Store Setup

```ts ! zustand/tests/basic.test.tsx
// Creating a Zustand store
// !callout[/create/] Zustand’s `create` function sets up the store with an initial state and an increment action.
const useBoundStore = create<CounterState>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));
```

## !!steps

!duration 220

!title 3. Counter Component and State Subscription

```ts ! zustand/tests/basic.test.tsx
// Component using Zustand store
// !callout[/useBoundStore/] The Counter component subscribes to the store’s `count` and retrieves the `inc` function.
const { count, inc } = useBoundStore();

// Component rendering logic
return <div>count: {count}</div>;
```

## !!steps

!duration 230

!title 4. Using unstable_batchedUpdates for Performance Optimization

```ts ! zustand/tests/basic.test.tsx
// Using unstable_batchedUpdates to optimize state updates
useEffect(() => {
  // !callout[/unstable_batchedUpdates/] `unstable_batchedUpdates` ensures that both `inc()` calls are processed in a single render, minimizing unnecessary re-renders.
  ReactDOM.unstable_batchedUpdates(() => {
    inc();
    inc();
  });
}, [inc]);
```

## !!steps

!duration 210

!title 5. Rendering the Component and Asserting the Final Result

```ts ! zustand/tests/basic.test.tsx
// Rendering and asserting the final state
// !callout[/findByText/] After rendering, `findByText` verifies that the count has been incremented twice and displays "count: 2".
const { findByText } = render(<Counter />);

await findByText('count: 2');
```