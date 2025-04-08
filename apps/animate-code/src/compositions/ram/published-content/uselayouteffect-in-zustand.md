!videoTitle useLayoutEffect in Zustand Test-Case Explained

## !!steps

!duration 220

!title 1. Introduction to useLayoutEffect

```ts ! react/index.js
// useLayoutEffect hook
// !callout[/useLayoutEffect/] React's useLayoutEffect hook runs synchronously after DOM mutations but before the browser paints the screen, ensuring immediate updates without visual inconsistencies.
import { useLayoutEffect } from 'react';
```

## !!steps

!duration 210

!title 2. The Need for useLayoutEffect in Zustand

```ts ! zustand/src/vanilla.ts
// Example scenario where useLayoutEffect is needed
// !callout[/increment/] useLayoutEffect ensures that state changes and updates are reflected immediately before the browser repaints, crucial for managing state and subscriber updates.
useLayoutEffect(increment, []);
```

## !!steps

!duration 220

!title 3. Initializing the Store and Increment Function

```ts ! zustand/src/vanilla.ts
// Zustand test case setup
it('ensures the correct subscriber is removed on unmount', 
  async () => {
    // !callout[/useBoundStore/] Initializes Zustand store and increment function.
    const useBoundStore = create(() => ({ count: 0 }));
    const api = useBoundStore;

    function increment() {
      api.setState(({ count }) => ({ count: count + 1 }));
    }
```

## !!steps

!duration 220

!title 4. Creating the Count Component

```ts ! zustand/src/vanilla.ts
// The Count component that subscribes to the store
// !callout[/Count/] Displays the current count from the store.
  function Count() {
    const c = useBoundStore((s) => s.count);
    return <div>count: {c}</div>;
  }
```

## !!steps

!duration 230

!title 5. Using useLayoutEffect in CountWithInitialIncrement

```ts ! zustand/src/vanilla.ts
// Using useLayoutEffect to 
// increment count before rendering
// !callout[/CountWithInitialIncrement/] Ensures increment happens before the component's UI is rendered.
  function CountWithInitialIncrement() {
    useLayoutEffect(increment, []);
    return <Count />;
  }
```

## !!steps

!duration 240

!title 6. Switching Components Dynamically

```ts ! zustand/src/vanilla.ts
// Switching between 
// CountWithInitialIncrement and Count components
// !callout[/Component/] Demonstrates component switching and state updates using useLayoutEffect.
  function Component() {
    const [Counter, setCounter] = useState(
      () => CountWithInitialIncrement
    );
    useLayoutEffect(() => {
      setCounter(() => Count);
    }, []);
    return (
      <>
        <Counter />
        <Count />
      </>
    );
  }
```

## !!steps

!duration 230

!title 7. Rendering and Verifying State Updates

```ts ! zustand/src/vanilla.ts
// Rendering and checking state updates
  const { findAllByText } = render(
    <>
      <Component />
    </>,
  );

  // !callout[/findAllByText/] Validates that state updates correctly and reflects in both components.
  expect((await findAllByText('count: 1')).length).toBe(2);

  act(increment);

  expect((await findAllByText('count: 2')).length).toBe(2);
});
```