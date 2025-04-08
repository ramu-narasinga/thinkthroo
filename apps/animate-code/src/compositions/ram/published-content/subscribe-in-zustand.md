!videoTitle subscribe() usage in Zustand's source code

## !!steps

!duration 200

!title 1. What is subscribe() in Zustand?

```js ! zustand/src/vanilla.ts
const useStore = create((set) => ({ count: 0 }));

// !callout[/subscribe/] The `subscribe()` method in Zustand allows you to listen for state changes without forcing a re-render. It's useful for optimizing performance in React apps.
useStore.subscribe((state) => {
  console.log("State changed: ", state);
});
```

## !!steps

!duration 200

!title 2. How subscribe() Manages Listeners

```js ! zustand/src/vanilla.ts
const subscribe: StoreApi<TState>['subscribe'] = (listener) => {
  listeners.add(listener);
  
  // !callout[/return/] When `subscribe()` returns, it provides a function to remove the listener from the set, ensuring it stops receiving updates.
  return () => listeners.delete(listener);
}
```

## !!steps

!duration 200

!title 3. Using subscribe() in a React Component

```js ! /component.jsx
const useCountStore = create((set) => ({ count: 0 }));

const CounterComponent = () => {
  const countRef = useRef(useCountStore.getState().count);

  // !callout[/useCountStore.subscribe/] Using `subscribe()` like this allows you to update values directly without triggering re-renders, keeping your app smooth and responsive.
  useEffect(() => useCountStore.subscribe(
    (state) => (countRef.current = state.count)
  ), []);

}
```