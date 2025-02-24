!videoTitle Batched Updates in React Event Handlers vs Non-Event Handlers

## !!steps

!duration 200

!title 1. Overview of Batched Updates in React

```ts ! react/src/index.ts
// React batches "updates" automatically in event handlers
// !callout[/onClick/] React batches "updates" inside event handlers by default, reducing re-renders.
<button onClick={() => {
  setCount(count + 1);
  setAnotherValue(true);
}}>Update State</button>
```

## !!steps

!duration 220

!title 2. How React Batches State Updates Automatically in Event Handlers

```ts ! react/src/index.ts
// State updates inside event handlers 
// are automatically batched by React
// !callout[/handleClick/] When these updates happen inside an event handler, React batches them into a single render.
const handleClick = () => {
  setCount(count + 1);
  setAnotherValue(true);
};
```

## !!steps

!duration 230

!title 3. Non-Event Handlers: Batching with ReactDOM.unstable_batchedUpdates

```ts ! zustand/tests/basic.test.tsx
// React does not batch state updates 
// outside of event handlers by default
// !callout[/useEffect/] Outside event handlers, React doesn't batch "updates" unless wrapped with `unstable_batchedUpdates`.
useEffect(() => {
  setCount(count + 1);
  setAnotherValue(true); // This causes two separate renders
}, []);
```

## !!steps

!duration 240

!title 4. Forcing Batching Outside Event Handlers

```ts ! zustand/tests/basic.test.tsx
// Batching outside event handlers 
// with `ReactDOM.unstable_batchedUpdates`
useEffect(() => {
  // !callout[/unstable_batchedUpdates/] Using `ReactDOM.unstable_batchedUpdates`, you can force batching outside of event-driven contexts.
  ReactDOM.unstable_batchedUpdates(() => {
    setCount(count + 1);
    setAnotherValue(true); // This causes only one render
  });
}, []);
```

## !!steps

!duration 210

!title 5. Comparison: Batched vs Non-Batched Updates

```ts ! zustand/tests/basic.test.tsx
// Example comparing batched vs non-batched updates
// !callout[/setTimeout/] Without `unstable_batchedUpdates`, each update triggers a separate render Before React 18.0, but after React 18.0, updates inside setTimeOut, promises are batched but not useEffect.
setTimeout(() => {
  setCount(count + 1);  // One render
  setAnotherValue(true);  // Another render
}, 1000);

// With `unstable_batchedUpdates`, 
// both updates trigger a single render.
useEffect(() => {
  ReactDOM.unstable_batchedUpdates(() => {
    setCount(count + 1);
    setAnotherValue(true);
  });
}, []);
```