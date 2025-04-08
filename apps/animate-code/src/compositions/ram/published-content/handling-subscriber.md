!videoTitle Handling Subscriber Overriding in Zustand - Github Issue #84

## !!steps

!duration 200

!title 1. Subscriber issue that's fixed

```ts ! react/src/issues/backgroundIssue84.ts
// Background information on Issue #84
// !callout[/create/] Subscribers in Zustand were reported to be getting orphaned or corrupted when state updates occurred during component lifecycle events, like unmounts or re-renders.
import { create } from 'zustand';

const useBoundStore = create(() => ({ count: 0 }));
```

## !!steps

!duration 200

!title 2. Implementing the Test Case

```ts ! react/src/issues/testCaseIssue84.ts
// Implementing the test case for Issue #84
// !callout[/Count/] The test case ensures that Zustand correctly handles subscribers, particularly focusing on removing and updating subscribers during component lifecycle events.
function Count() {
  const c = useBoundStore((s) => s.count);
  return <div>count: {c}</div>;
}

function CountWithInitialIncrement() {
  useLayoutEffect(increment, []);
  return <Count />;
}
```

## !!steps

!duration 200

!title 3. Dynamic Component Switching

```ts ! react/src/issues/testCaseIssue84.ts
// Dynamic component switching in the test case
// !callout[/Component/] Switch between components using useLayoutEffect to test subscriber management during component lifecycle changes.
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

!duration 200

!title 4. Validating Test Results

```ts ! react/src/issues/testCaseIssue84.ts
// Validating test results for Issue #84
// !callout[/findAllByText/] Ensure that the state updates are correctly reflected in all components and that the test passes, verifying the fix for the subscriber corruption issue.
const { findAllByText } = render(<Component />);

expect((await findAllByText('count: 1')).length).toBe(2);

act(increment);

expect((await findAllByText('count: 2')).length).toBe(2);
```